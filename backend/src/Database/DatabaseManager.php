<?php

namespace App\Database;

use PDO;
use PDOException;

class DatabaseManager
{
    private static $connections = [];
    
    public static function getConnection(string $tenant): PDO
    {
        if (!isset(self::$connections[$tenant])) {
            self::$connections[$tenant] = self::createConnection($tenant);
        }
        
        return self::$connections[$tenant];
    }
    
    private static function createConnection(string $tenant): PDO
    {
        $config = self::getTenantConfig($tenant);
        
        try {
            $dsn = "mysql:host={$config['host']};dbname={$config['database']};charset=utf8mb4";
            $pdo = new PDO($dsn, $config['username'], $config['password'], [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
            
            return $pdo;
        } catch (PDOException $e) {
            throw new \Exception("Database connection failed for tenant: {$tenant}. " . $e->getMessage());
        }
    }
    
    private static function getTenantConfig(string $tenant): array
    {
        $databaseMap = [
            'easy2work' => $_ENV['DB_EASY2WORK'] ?? 'baleeed5_easy2work',
            'gracescans' => $_ENV['DB_GRACESCANS'] ?? 'baleeed5_gracescans',
            'live' => $_ENV['DB_LIVE'] ?? 'baleeed5_live',
            'test' => $_ENV['DB_TEST'] ?? 'baleeed5_test_e2w',
        ];
        
        if (!isset($databaseMap[$tenant])) {
            throw new \Exception("Unknown tenant: {$tenant}");
        }
        
        return [
            'host' => $_ENV['DB_HOST'] ?? 'localhost',
            'port' => $_ENV['DB_PORT'] ?? 3306,
            'database' => $databaseMap[$tenant],
            'username' => $_ENV['DB_USERNAME'] ?? 'root',
            'password' => $_ENV['DB_PASSWORD'] ?? '',
        ];
    }
    
    public static function closeConnection(string $tenant): void
    {
        if (isset(self::$connections[$tenant])) {
            self::$connections[$tenant] = null;
            unset(self::$connections[$tenant]);
        }
    }
    
    public static function closeAllConnections(): void
    {
        foreach (array_keys(self::$connections) as $tenant) {
            self::closeConnection($tenant);
        }
    }
}
