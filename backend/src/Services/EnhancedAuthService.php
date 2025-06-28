<?php

namespace App\Services;

use App\Database\EnhancedDatabaseManager;
use App\Exceptions\AuthenticationException;
use App\Utils\SecurityUtils;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use PDO;

class EnhancedAuthService
{
    private string $jwtSecret;
    private int $jwtExpiry;
    private int $refreshExpiry;
    private int $maxFailedAttempts;
    private int $lockoutDuration;

    public function __construct()
    {
        $this->jwtSecret = $_ENV['JWT_SECRET'] ?? throw new \Exception('JWT_SECRET not configured');
        $this->jwtExpiry = (int)($_ENV['JWT_EXPIRATION'] ?? 3600); // 1 hour
        $this->refreshExpiry = (int)($_ENV['JWT_REFRESH_EXPIRY'] ?? 86400 * 7); // 7 days
        $this->maxFailedAttempts = (int)($_ENV['MAX_FAILED_ATTEMPTS'] ?? 5);
        $this->lockoutDuration = (int)($_ENV['LOCKOUT_DURATION'] ?? 900); // 15 minutes
    }

    /**
     * Authenticate user with enhanced security
     */
    public function authenticate(string $tenantId, string $email, string $password, string $ipAddress = null, string $userAgent = null): ?array
    {
        $db = EnhancedDatabaseManager::getConnection($tenantId);
        
        // Check if user exists and get account status
        $user = $this->getUserByEmail($tenantId, $email);
        
        if (!$user) {
            $this->logFailedAttempt($tenantId, $email, $ipAddress, 'user_not_found');
            throw new AuthenticationException('Invalid credentials');
        }
        
        // Check account status
        if ($user['status'] !== 'active') {
            $this->logFailedAttempt($tenantId, $email, $ipAddress, 'account_disabled');
            throw new AuthenticationException('Account is disabled');
        }
        
        // Check if account is locked
        if ($this->isAccountLocked($user)) {
            throw new AuthenticationException('Account is temporarily locked due to multiple failed attempts');
        }
        
        // Verify password
        if (!password_verify($password, $user['password'])) {
            $this->handleFailedLogin($tenantId, $user['id'], $ipAddress);
            throw new AuthenticationException('Invalid credentials');
        }
        
        // Check if password needs update (older than 90 days)
        if ($this->passwordNeedsUpdate($user['password_changed_at'])) {
            return [
                'status' => 'password_update_required',
                'user_id' => $user['id'],
                'message' => 'Password update required'
            ];
        }
        
        // Generate tokens
        $tokens = $this->generateTokens($tenantId, $user);
        
        // Create session record
        $sessionId = $this->createSession($tenantId, $user['id'], $tokens['access_token'], $tokens['refresh_token'], $ipAddress, $userAgent);
        
        // Clear failed attempts and update last login
        $this->clearFailedAttempts($tenantId, $user['id']);
        $this->updateLastLogin($tenantId, $user['id']);
        
        // Log successful login
        $this->logSuccessfulLogin($tenantId, $user['id'], $ipAddress, $userAgent);
        
        return [
            'status' => 'success',
            'user' => [
                'id' => $user['id'],
                'uuid' => $user['uuid'],
                'email' => $user['email'],
                'first_name' => $user['first_name'],
                'last_name' => $user['last_name'],
                'role' => $user['role'],
                'tenant_id' => $tenantId,
                'preferences' => json_decode($user['preferences'] ?? '{}', true)
            ],
            'tokens' => $tokens,
            'session_id' => $sessionId
        ];
    }
    
    /**
     * Generate JWT tokens with enhanced payload
     */
    private function generateTokens(string $tenantId, array $user): array
    {
        $now = time();
        
        // Access token payload
        $accessPayload = [
            'iss' => $_ENV['JWT_ISSUER'] ?? 'ibms-api',
            'sub' => $user['uuid'],
            'aud' => $tenantId,
            'iat' => $now,
            'exp' => $now + $this->jwtExpiry,
            'jti' => $this->generateJTI(),
            'user_id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'tenant_id' => $tenantId,
            'permissions' => $this->getUserPermissions($tenantId, $user['role'])
        ];
        
        // Refresh token payload
        $refreshPayload = [
            'iss' => $_ENV['JWT_ISSUER'] ?? 'ibms-api',
            'sub' => $user['uuid'],
            'aud' => $tenantId,
            'iat' => $now,
            'exp' => $now + $this->refreshExpiry,
            'jti' => $this->generateJTI(),
            'type' => 'refresh',
            'user_id' => $user['id'],
            'tenant_id' => $tenantId
        ];
        
        return [
            'access_token' => JWT::encode($accessPayload, $this->jwtSecret, 'HS256'),
            'refresh_token' => JWT::encode($refreshPayload, $this->jwtSecret, 'HS256'),
            'token_type' => 'Bearer',
            'expires_in' => $this->jwtExpiry,
            'expires_at' => $now + $this->jwtExpiry
        ];
    }
    
    /**
     * Validate and decode JWT token
     */
    public function validateToken(string $token): ?array
    {
        try {
            $decoded = JWT::decode($token, new Key($this->jwtSecret, 'HS256'));
            return (array) $decoded;
        } catch (\Exception $e) {
            return null;
        }
    }
    
    /**
     * Refresh access token using refresh token
     */
    public function refreshToken(string $refreshToken): ?array
    {
        $payload = $this->validateToken($refreshToken);
        
        if (!$payload || ($payload['type'] ?? '') !== 'refresh') {
            throw new AuthenticationException('Invalid refresh token');
        }
        
        // Check if session exists and is valid
        $session = $this->getActiveSession($payload['tenant_id'], $payload['user_id'], $refreshToken);
        if (!$session) {
            throw new AuthenticationException('Session not found or expired');
        }
        
        // Get current user data
        $user = $this->getUserById($payload['tenant_id'], $payload['user_id']);
        if (!$user || $user['status'] !== 'active') {
            throw new AuthenticationException('User account is not active');
        }
        
        // Generate new tokens
        $tokens = $this->generateTokens($payload['tenant_id'], $user);
        
        // Update session with new tokens
        $this->updateSession($payload['tenant_id'], $session['id'], $tokens['access_token'], $tokens['refresh_token']);
        
        return [
            'user' => [
                'id' => $user['id'],
                'uuid' => $user['uuid'],
                'email' => $user['email'],
                'first_name' => $user['first_name'],
                'last_name' => $user['last_name'],
                'role' => $user['role'],
                'tenant_id' => $payload['tenant_id']
            ],
            'tokens' => $tokens
        ];
    }
    
    /**
     * Logout user and invalidate session
     */
    public function logout(string $tenantId, string $token): bool
    {
        $payload = $this->validateToken($token);
        if (!$payload) {
            return false;
        }
        
        // Invalidate session
        return $this->invalidateSession($tenantId, $payload['user_id'], $token);
    }
    
    /**
     * Register new user with enhanced validation
     */
    public function register(string $tenantId, array $data): array
    {
        $db = EnhancedDatabaseManager::getConnection($tenantId);
        
        // Validate required fields
        $required = ['first_name', 'last_name', 'email', 'password'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                throw new \InvalidArgumentException("Field '{$field}' is required");
            }
        }
        
        // Validate email format
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException('Invalid email format');
        }
        
        // Check if user already exists
        if ($this->getUserByEmail($tenantId, $data['email'])) {
            throw new \InvalidArgumentException('User already exists with this email');
        }
        
        // Validate password strength
        if (!$this->validatePasswordStrength($data['password'])) {
            throw new \InvalidArgumentException('Password does not meet security requirements');
        }
        
        // Hash password
        $hashedPassword = password_hash($data['password'], PASSWORD_ARGON2ID, [
            'memory_cost' => 65536,
            'time_cost' => 4,
            'threads' => 3
        ]);
        
        // Generate UUID
        $uuid = $this->generateUUID();
        
        // Insert user
        $sql = "
            INSERT INTO users (
                uuid, tenant_id, email, password, first_name, last_name, 
                role, status, email_verified_at, password_changed_at
            ) VALUES (
                :uuid, :tenant_id, :email, :password, :first_name, :last_name,
                :role, :status, :email_verified_at, NOW()
            )
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([
            'uuid' => $uuid,
            'tenant_id' => $tenantId,
            'email' => $data['email'],
            'password' => $hashedPassword,
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'role' => $data['role'] ?? 'employee',
            'status' => $data['status'] ?? 'pending',
            'email_verified_at' => $data['auto_verify'] ?? false ? date('Y-m-d H:i:s') : null
        ]);
        
        $userId = $db->lastInsertId();
        
        return [
            'user_id' => $userId,
            'uuid' => $uuid,
            'email' => $data['email'],
            'status' => $data['status'] ?? 'pending'
        ];
    }
    
    // Helper methods
    
    private function getUserByEmail(string $tenantId, string $email): ?array
    {
        $sql = "
            SELECT id, uuid, email, password, first_name, last_name, role, status,
                   failed_login_attempts, locked_until, password_changed_at, preferences
            FROM users 
            WHERE tenant_id = :tenant_id AND email = :email AND deleted_at IS NULL
        ";
        
        $stmt = EnhancedDatabaseManager::executeWithTenant($tenantId, $sql, [
            'tenant_id' => $tenantId,
            'email' => $email
        ]);
        
        return $stmt->fetch() ?: null;
    }
    
    private function getUserById(string $tenantId, int $userId): ?array
    {
        $sql = "
            SELECT id, uuid, email, password, first_name, last_name, role, status,
                   failed_login_attempts, locked_until, password_changed_at, preferences
            FROM users 
            WHERE tenant_id = :tenant_id AND id = :id AND deleted_at IS NULL
        ";
        
        $stmt = EnhancedDatabaseManager::executeWithTenant($tenantId, $sql, [
            'tenant_id' => $tenantId,
            'id' => $userId
        ]);
        
        return $stmt->fetch() ?: null;
    }
    
    private function isAccountLocked(array $user): bool
    {
        if (!$user['locked_until']) {
            return false;
        }
        
        return strtotime($user['locked_until']) > time();
    }
    
    private function handleFailedLogin(string $tenantId, int $userId, ?string $ipAddress): void
    {
        $sql = "
            UPDATE users 
            SET failed_login_attempts = failed_login_attempts + 1,
                locked_until = CASE 
                    WHEN failed_login_attempts + 1 >= :max_attempts 
                    THEN DATE_ADD(NOW(), INTERVAL :lockout_duration SECOND)
                    ELSE locked_until 
                END
            WHERE tenant_id = :tenant_id AND id = :id
        ";
        
        EnhancedDatabaseManager::executeWithTenant($tenantId, $sql, [
            'tenant_id' => $tenantId,
            'id' => $userId,
            'max_attempts' => $this->maxFailedAttempts,
            'lockout_duration' => $this->lockoutDuration
        ]);
        
        $this->logFailedAttempt($tenantId, null, $ipAddress, 'invalid_password', $userId);
    }
    
    private function clearFailedAttempts(string $tenantId, int $userId): void
    {
        $sql = "
            UPDATE users 
            SET failed_login_attempts = 0, locked_until = NULL
            WHERE tenant_id = :tenant_id AND id = :id
        ";
        
        EnhancedDatabaseManager::executeWithTenant($tenantId, $sql, [
            'tenant_id' => $tenantId,
            'id' => $userId
        ]);
    }
    
    private function updateLastLogin(string $tenantId, int $userId): void
    {
        $sql = "
            UPDATE users 
            SET last_login_at = NOW()
            WHERE tenant_id = :tenant_id AND id = :id
        ";
        
        EnhancedDatabaseManager::executeWithTenant($tenantId, $sql, [
            'tenant_id' => $tenantId,
            'id' => $userId
        ]);
    }
    
    private function createSession(string $tenantId, int $userId, string $accessToken, string $refreshToken, ?string $ipAddress, ?string $userAgent): string
    {
        $sessionToken = bin2hex(random_bytes(32));
        
        $sql = "
            INSERT INTO user_sessions (
                tenant_id, user_id, session_token, refresh_token, 
                ip_address, user_agent, expires_at
            ) VALUES (
                :tenant_id, :user_id, :session_token, :refresh_token,
                :ip_address, :user_agent, DATE_ADD(NOW(), INTERVAL :expires SECOND)
            )
        ";
        
        EnhancedDatabaseManager::executeWithTenant($tenantId, $sql, [
            'tenant_id' => $tenantId,
            'user_id' => $userId,
            'session_token' => $sessionToken,
            'refresh_token' => $refreshToken,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'expires' => $this->refreshExpiry
        ]);
        
        return $sessionToken;
    }
    
    private function getActiveSession(string $tenantId, int $userId, string $refreshToken): ?array
    {
        $sql = "
            SELECT id, session_token, expires_at
            FROM user_sessions 
            WHERE tenant_id = :tenant_id AND user_id = :user_id 
                  AND refresh_token = :refresh_token AND is_active = 1
                  AND expires_at > NOW()
        ";
        
        $stmt = EnhancedDatabaseManager::executeWithTenant($tenantId, $sql, [
            'tenant_id' => $tenantId,
            'user_id' => $userId,
            'refresh_token' => $refreshToken
        ]);
        
        return $stmt->fetch() ?: null;
    }
    
    private function updateSession(string $tenantId, int $sessionId, string $accessToken, string $refreshToken): void
    {
        $sql = "
            UPDATE user_sessions 
            SET refresh_token = :refresh_token, last_activity = NOW()
            WHERE tenant_id = :tenant_id AND id = :id
        ";
        
        EnhancedDatabaseManager::executeWithTenant($tenantId, $sql, [
            'tenant_id' => $tenantId,
            'id' => $sessionId,
            'refresh_token' => $refreshToken
        ]);
    }
    
    private function invalidateSession(string $tenantId, int $userId, string $token): bool
    {
        $sql = "
            UPDATE user_sessions 
            SET is_active = 0
            WHERE tenant_id = :tenant_id AND user_id = :user_id
        ";
        
        $stmt = EnhancedDatabaseManager::executeWithTenant($tenantId, $sql, [
            'tenant_id' => $tenantId,
            'user_id' => $userId
        ]);
        
        return $stmt->rowCount() > 0;
    }
    
    private function getUserPermissions(string $tenantId, string $role): array
    {
        // Define role-based permissions
        $permissions = [
            'super_admin' => ['*'],
            'admin' => [
                'users.read', 'users.write', 'users.delete',
                'clients.read', 'clients.write', 'clients.delete',
                'orders.read', 'orders.write', 'orders.delete',
                'finance.read', 'finance.write',
                'reports.read', 'settings.write'
            ],
            'manager' => [
                'clients.read', 'clients.write',
                'orders.read', 'orders.write',
                'finance.read', 'reports.read'
            ],
            'employee' => [
                'clients.read', 'orders.read', 'orders.write'
            ],
            'client' => [
                'orders.read'
            ]
        ];
        
        return $permissions[$role] ?? [];
    }
    
    private function passwordNeedsUpdate(string $passwordChangedAt): bool
    {
        $maxAge = 90; // days
        return strtotime($passwordChangedAt) < strtotime("-{$maxAge} days");
    }
    
    private function validatePasswordStrength(string $password): bool
    {
        // Minimum 8 characters, at least one uppercase, lowercase, number, and special character
        return preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/', $password);
    }
    
    private function generateJTI(): string
    {
        return bin2hex(random_bytes(16));
    }
    
    private function generateUUID(): string
    {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
    
    private function logFailedAttempt(string $tenantId, ?string $email, ?string $ipAddress, string $reason, ?int $userId = null): void
    {
        // Log to audit_logs table
        $sql = "
            INSERT INTO audit_logs (
                tenant_id, user_id, action, entity_type, 
                description, ip_address, metadata
            ) VALUES (
                :tenant_id, :user_id, 'failed_login', 'user',
                :description, :ip_address, :metadata
            )
        ";
        
        EnhancedDatabaseManager::executeWithTenant($tenantId, $sql, [
            'tenant_id' => $tenantId,
            'user_id' => $userId,
            'description' => "Failed login attempt: {$reason}",
            'ip_address' => $ipAddress,
            'metadata' => json_encode(['email' => $email, 'reason' => $reason])
        ]);
    }
    
    private function logSuccessfulLogin(string $tenantId, int $userId, ?string $ipAddress, ?string $userAgent): void
    {
        $sql = "
            INSERT INTO audit_logs (
                tenant_id, user_id, action, entity_type,
                description, ip_address, user_agent
            ) VALUES (
                :tenant_id, :user_id, 'successful_login', 'user',
                'User logged in successfully', :ip_address, :user_agent
            )
        ";
        
        EnhancedDatabaseManager::executeWithTenant($tenantId, $sql, [
            'tenant_id' => $tenantId,
            'user_id' => $userId,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent
        ]);
    }
}
