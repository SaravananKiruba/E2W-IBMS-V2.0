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
        $this->jwtExpiry = (int)($_ENV['JWT_EXPIRY'] ?? 3600); // 1 hour
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
                'firstName' => $user['first_name'] ?? '',
                'lastName' => $user['last_name'] ?? '',
                'role' => $user['role'] ?? 'user',
                'tenant' => $tenant
            ],
            'tokens' => [
                'accessToken' => $accessToken,
                'refreshToken' => $refreshToken,
                'expiresIn' => $this->jwtExpiry
            ]
        ];
    }

    public function createUser(string $tenant, array $data): int
    {
        $db = DatabaseManager::getConnection($tenant);
        
        // Check if user already exists
        $checkSql = "SELECT id FROM user_table WHERE username = :username OR email = :email";
        $checkStmt = $db->prepare($checkSql);
        $checkStmt->execute([
            ':username' => $data['username'],
            ':email' => $data['email']
        ]);
        
        if ($checkStmt->fetch()) {
            throw new \Exception('User already exists with this username or email');
        }
        
        $sql = "
            INSERT INTO user_table (
                username,
                email,
                password,
                first_name,
                last_name,
                role,
                status,
                created_at
            ) VALUES (
                :username,
                :email,
                MD5(:password),
                :firstName,
                :lastName,
                :role,
                'active',
                NOW()
            )
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':username' => $data['username'],
            ':email' => $data['email'],
            ':password' => $data['password'],
            ':firstName' => $data['firstName'] ?? '',
            ':lastName' => $data['lastName'] ?? '',
            ':role' => $data['role'] ?? 'user'
        ]);
        
        return $db->lastInsertId();
    }

    public function refreshToken(string $refreshToken): ?array
    {
        try {
            $decoded = JWT::decode($refreshToken, new Key($this->jwtSecret, 'HS256'));
            
            if ($decoded->type !== 'refresh') {
                return null;
            }
            
            // Verify refresh token exists in database
            $tenant = $decoded->tenant;
            $userId = $decoded->user_id;
            
            if (!$this->verifyRefreshToken($tenant, $userId, $refreshToken)) {
                return null;
            }
            
            // Get user data
            $db = DatabaseManager::getConnection($tenant);
            $sql = "SELECT * FROM user_table WHERE id = :id AND status = 'active'";
            $stmt = $db->prepare($sql);
            $stmt->execute([':id' => $userId]);
            $user = $stmt->fetch();
            
            if (!$user) {
                return null;
            }
            
            // Generate new tokens
            $payload = [
                'user_id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'role' => $user['role'] ?? 'user',
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
            
            $newRefreshToken = JWT::encode($refreshPayload, $this->jwtSecret, 'HS256');
            
            // Update refresh token in database
            $this->storeRefreshToken($tenant, $user['id'], $newRefreshToken);
            
            return [
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'firstName' => $user['first_name'] ?? '',
                    'lastName' => $user['last_name'] ?? '',
                    'role' => $user['role'] ?? 'user',
                    'tenant' => $tenant
                ],
                'tokens' => [
                    'accessToken' => $accessToken,
                    'refreshToken' => $newRefreshToken,
                    'expiresIn' => $this->jwtExpiry
                ]
            ];
            
        } catch (\Exception $e) {
            return null;
        }
    }

    public function verifyToken(string $token): ?array
    {
        try {
            $decoded = JWT::decode($token, new Key($this->jwtSecret, 'HS256'));
            
            return [
                'user_id' => $decoded->user_id,
                'username' => $decoded->username,
                'email' => $decoded->email,
                'role' => $decoded->role,
                'tenant' => $decoded->tenant
            ];
            
        } catch (\Exception $e) {
            return null;
        }
    }

    public function revokeToken(string $token): bool
    {
        // For now, we'll just add it to a blacklist table
        // In production, consider using Redis for better performance
        try {
            $decoded = JWT::decode($token, new Key($this->jwtSecret, 'HS256'));
            $tenant = $decoded->tenant;
            
            $db = DatabaseManager::getConnection($tenant);
            $sql = "
                INSERT INTO token_blacklist (token_hash, expires_at, created_at) 
                VALUES (MD5(:token), FROM_UNIXTIME(:expires), NOW())
                ON DUPLICATE KEY UPDATE created_at = NOW()
            ";
            
            $stmt = $db->prepare($sql);
            $stmt->execute([
                ':token' => $token,
                ':expires' => $decoded->exp
            ]);
            
            return true;
            
        } catch (\Exception $e) {
            return false;
        }
    }

    private function storeRefreshToken(string $tenant, int $userId, string $refreshToken): void
    {
        $db = DatabaseManager::getConnection($tenant);
        
        // Remove old refresh tokens for this user
        $deleteSql = "DELETE FROM refresh_tokens WHERE user_id = :userId";
        $deleteStmt = $db->prepare($deleteSql);
        $deleteStmt->execute([':userId' => $userId]);
        
        // Store new refresh token
        $sql = "
            INSERT INTO refresh_tokens (user_id, token_hash, expires_at, created_at) 
            VALUES (:userId, MD5(:token), FROM_UNIXTIME(:expires), NOW())
        ";
        
        $decoded = JWT::decode($refreshToken, new Key($this->jwtSecret, 'HS256'));
        
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':userId' => $userId,
            ':token' => $refreshToken,
            ':expires' => $decoded->exp
        ]);
    }

    private function verifyRefreshToken(string $tenant, int $userId, string $refreshToken): bool
    {
        $db = DatabaseManager::getConnection($tenant);
        
        $sql = "
            SELECT id FROM refresh_tokens 
            WHERE user_id = :userId 
            AND token_hash = MD5(:token) 
            AND expires_at > NOW()
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':userId' => $userId,
            ':token' => $refreshToken
        ]);
        
        return $stmt->fetch() !== false;
    }

    private function updateLastLogin(string $tenant, int $userId): void
    {
        $db = DatabaseManager::getConnection($tenant);
        
        $sql = "UPDATE user_table SET last_login = NOW() WHERE id = :userId";
        $stmt = $db->prepare($sql);
        $stmt->execute([':userId' => $userId]);
    }
}
