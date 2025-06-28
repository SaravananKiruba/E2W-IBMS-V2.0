<?php

namespace App\Services;

use App\Database\DatabaseManager;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use PDO;

class AuthService
{
    private string $jwtSecret;
    private int $jwtExpiry;
    private int $refreshExpiry;

    public function __construct()
    {
        $this->jwtSecret = $_ENV['JWT_SECRET'] ?? 'your-secret-key-change-this';
        $this->jwtExpiry = (int)($_ENV['JWT_EXPIRATION'] ?? 3600); // 1 hour
        $this->refreshExpiry = (int)($_ENV['JWT_REFRESH_EXPIRY'] ?? 86400 * 7); // 7 days
    }

    public function authenticate(string $tenant, string $email, string $password): ?array
    {
        $db = DatabaseManager::getConnection($tenant);
        
        // Check if user exists with the given email
        $sql = "
            SELECT id, name, email, password, role, status, tenant_id
            FROM users 
            WHERE email = :email 
            AND status = 'active'
            LIMIT 1
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($password, $user['password'])) {
            return null;
        }
        
        // Generate tokens
        $payload = [
            'user_id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
            'tenant' => $tenant,
            'iat' => time(),
            'exp' => time() + $this->jwtExpiry
        ];
        
        $accessToken = JWT::encode($payload, $this->jwtSecret, 'HS256');
        
        $refreshPayload = [
            'user_id' => $user['id'],
            'tenant' => $tenant,
            'type' => 'refresh',
            'iat' => time(),
            'exp' => time() + $this->refreshExpiry
        ];
        
        $refreshToken = JWT::encode($refreshPayload, $this->jwtSecret, 'HS256');
        
        // Update last login
        $this->updateLastLogin($tenant, $user['id']);
        
        return [
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'tenant' => $tenant
            ],
            'tokens' => [
                'accessToken' => $accessToken,
                'refreshToken' => $refreshToken,
                'expiresIn' => $this->jwtExpiry
            ]
        ];
    }

    public function register(string $tenant, array $data): ?array
    {
        $db = DatabaseManager::getConnection($tenant);
        
        // Check if user already exists
        $checkSql = "SELECT id FROM users WHERE email = :email";
        $checkStmt = $db->prepare($checkSql);
        $checkStmt->execute([':email' => $data['email']]);
        
        if ($checkStmt->fetch()) {
            throw new \Exception('User already exists with this email');
        }
        
        // Hash password
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
        
        $sql = "
            INSERT INTO users (
                name,
                email,
                password,
                role,
                tenant_id,
                status,
                created_at
            ) VALUES (
                :name,
                :email,
                :password,
                :role,
                :tenant_id,
                'active',
                NOW()
            )
        ";
        
        $stmt = $db->prepare($sql);
        $success = $stmt->execute([
            ':name' => $data['name'],
            ':email' => $data['email'],
            ':password' => $hashedPassword,
            ':role' => $data['role'] ?? 'employee',
            ':tenant_id' => $tenant
        ]);
        
        if (!$success) {
            throw new \Exception('Failed to create user');
        }
        
        $userId = $db->lastInsertId();
        
        // Auto-login the new user
        return $this->authenticate($tenant, $data['email'], $data['password']);
    }

    public function verifyToken(string $token): ?array
    {
        try {
            $decoded = JWT::decode($token, new Key($this->jwtSecret, 'HS256'));
            return (array) $decoded;
        } catch (\Exception $e) {
            return null;
        }
    }

    public function getUserFromToken(string $token): ?array
    {
        $payload = $this->verifyToken($token);
        if (!$payload) {
            return null;
        }

        $tenant = $payload['tenant'] ?? null;
        $userId = $payload['user_id'] ?? null;

        if (!$tenant || !$userId) {
            return null;
        }

        $db = DatabaseManager::getConnection($tenant);
        
        $sql = "
            SELECT id, name, email, role, status, tenant_id
            FROM users 
            WHERE id = :id 
            AND status = 'active'
            LIMIT 1
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([':id' => $userId]);
        $user = $stmt->fetch();
        
        if (!$user) {
            return null;
        }
        
        return [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
            'tenant' => $tenant
        ];
    }

    public function refreshToken(string $refreshToken): ?array
    {
        try {
            $payload = $this->verifyToken($refreshToken);
            
            if (!$payload || ($payload['type'] ?? '') !== 'refresh') {
                return null;
            }

            $tenant = $payload['tenant'];
            $userId = $payload['user_id'];

            // Get user data
            $db = DatabaseManager::getConnection($tenant);
            $sql = "
                SELECT id, name, email, role, status
                FROM users 
                WHERE id = :id 
                AND status = 'active'
                LIMIT 1
            ";
            
            $stmt = $db->prepare($sql);
            $stmt->execute([':id' => $userId]);
            $user = $stmt->fetch();
            
            if (!$user) {
                return null;
            }

            // Generate new access token
            $newPayload = [
                'user_id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'tenant' => $tenant,
                'iat' => time(),
                'exp' => time() + $this->jwtExpiry
            ];
            
            $accessToken = JWT::encode($newPayload, $this->jwtSecret, 'HS256');
            
            return [
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'role' => $user['role'],
                    'tenant' => $tenant
                ],
                'tokens' => [
                    'accessToken' => $accessToken,
                    'refreshToken' => $refreshToken,
                    'expiresIn' => $this->jwtExpiry
                ]
            ];
        } catch (\Exception $e) {
            return null;
        }
    }

    private function updateLastLogin(string $tenant, int $userId): void
    {
        try {
            $db = DatabaseManager::getConnection($tenant);
            $sql = "UPDATE users SET last_login = NOW() WHERE id = :id";
            $stmt = $db->prepare($sql);
            $stmt->execute([':id' => $userId]);
        } catch (\Exception $e) {
            // Log error but don't fail authentication
            error_log("Failed to update last login for user {$userId}: " . $e->getMessage());
        }
    }

    public function logout(string $tenant, int $userId): bool
    {
        // In a more complex system, you might want to blacklist the token
        // For now, we'll just return true as the client will remove the token
        return true;
    }
}
