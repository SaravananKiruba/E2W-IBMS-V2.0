<?php

namespace App\Database;

use PDO;
use PDOException;
use App\Exceptions\TenantNotFoundException;
use App\Exceptions\DatabaseConnectionException;

class EnhancedDatabaseManager
{
    private static array $connections = [];
    private static array $tenantConfigs = [];
    private static bool $initialized = false;
    
    /**
     * Initialize the database manager with tenant configurations
     */
    public static function initialize(): void
    {
        if (self::$initialized) {
            return;
        }
        
        // Load tenant configurations from environment or database
        self::loadTenantConfigurations();
        self::$initialized = true;
    }
    
    /**
     * Get database connection for a specific tenant with connection pooling
     */
    public static function getConnection(string $tenantId): PDO
    {
        self::initialize();
        
        if (!isset(self::$tenantConfigs[$tenantId])) {
            throw new TenantNotFoundException("Tenant '{$tenantId}' not found");
        }
        
        $connectionKey = "tenant_{$tenantId}";
        
        if (!isset(self::$connections[$connectionKey]) || !self::isConnectionValid($connectionKey)) {
            self::$connections[$connectionKey] = self::createConnection($tenantId);
        }
        
        return self::$connections[$connectionKey];
    }
    
    /**
     * Create a new database connection for tenant
     */
    private static function createConnection(string $tenantId): PDO
    {
        $config = self::$tenantConfigs[$tenantId];
        
        try {
            $dsn = "mysql:host={$config['host']};dbname={$config['database']};charset=utf8mb4";
            
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_PERSISTENT => true,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
                PDO::ATTR_TIMEOUT => 30,
                PDO::MYSQL_ATTR_USE_BUFFERED_QUERY => true,
            ];
            
            $pdo = new PDO($dsn, $config['username'], $config['password'], $options);
            
            // Set tenant context for row-level security if using shared database
            if ($config['shared_database'] ?? false) {
                $stmt = $pdo->prepare("SET @tenant_id = :tenant_id");
                $stmt->execute(['tenant_id' => $tenantId]);
            }
            
            return $pdo;
            
        } catch (PDOException $e) {
            throw new DatabaseConnectionException(
                "Database connection failed for tenant '{$tenantId}': " . $e->getMessage(),
                $e->getCode(),
                $e
            );
        }
    }
    
    /**
     * Load tenant configurations from various sources
     */
    private static function loadTenantConfigurations(): void
    {
        // Option 1: Load from environment variables (current approach)
        self::$tenantConfigs = [
            'easy2work' => [
                'host' => $_ENV['DB_HOST'] ?? 'localhost',
                'port' => $_ENV['DB_PORT'] ?? 3306,
                'database' => $_ENV['DB_EASY2WORK'] ?? 'baleeed5_easy2work',
                'username' => $_ENV['DB_USERNAME'] ?? 'root',
                'password' => $_ENV['DB_PASSWORD'] ?? '',
                'shared_database' => false,
            ],
            'gracescans' => [
                'host' => $_ENV['DB_HOST'] ?? 'localhost',
                'port' => $_ENV['DB_PORT'] ?? 3306,
                'database' => $_ENV['DB_GRACESCANS'] ?? 'baleeed5_gracescans',
                'username' => $_ENV['DB_USERNAME'] ?? 'root',
                'password' => $_ENV['DB_PASSWORD'] ?? '',
                'shared_database' => false,
            ],
            'live' => [
                'host' => $_ENV['DB_HOST'] ?? 'localhost',
                'port' => $_ENV['DB_PORT'] ?? 3306,
                'database' => $_ENV['DB_LIVE'] ?? 'baleeed5_live',
                'username' => $_ENV['DB_USERNAME'] ?? 'root',
                'password' => $_ENV['DB_PASSWORD'] ?? '',
                'shared_database' => false,
            ],
            'test' => [
                'host' => $_ENV['DB_HOST'] ?? 'localhost',
                'port' => $_ENV['DB_PORT'] ?? 3306,
                'database' => $_ENV['DB_TEST'] ?? 'baleeed5_test_e2w',
                'username' => $_ENV['DB_USERNAME'] ?? 'root',
                'password' => $_ENV['DB_PASSWORD'] ?? '',
                'shared_database' => false,
            ],
        ];
        
        // Option 2: Load from database (for dynamic tenant management)
        // self::loadTenantsFromDatabase();
    }
    
    /**
     * Load tenant configurations from a central tenants database
     */
    private static function loadTenantsFromDatabase(): void
    {
        try {
            $masterDsn = "mysql:host={$_ENV['DB_HOST']};dbname={$_ENV['DB_MASTER']};charset=utf8mb4";
            $masterPdo = new PDO(
                $masterDsn, 
                $_ENV['DB_USERNAME'], 
                $_ENV['DB_PASSWORD'],
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
            );
            
            $stmt = $masterPdo->query("
                SELECT id, database_name, settings 
                FROM tenants 
                WHERE status = 'active'
            ");
            
            while ($tenant = $stmt->fetch()) {
                $settings = json_decode($tenant['settings'], true) ?? [];
                
                self::$tenantConfigs[$tenant['id']] = [
                    'host' => $settings['db_host'] ?? $_ENV['DB_HOST'],
                    'port' => $settings['db_port'] ?? $_ENV['DB_PORT'],
                    'database' => $tenant['database_name'],
                    'username' => $settings['db_username'] ?? $_ENV['DB_USERNAME'],
                    'password' => $settings['db_password'] ?? $_ENV['DB_PASSWORD'],
                    'shared_database' => $settings['shared_database'] ?? false,
                ];
            }
            
        } catch (PDOException $e) {
            // Fallback to environment configuration
            error_log("Failed to load tenant configurations from database: " . $e->getMessage());
        }
    }
    
    /**
     * Check if connection is still valid
     */
    private static function isConnectionValid(string $connectionKey): bool
    {
        if (!isset(self::$connections[$connectionKey])) {
            return false;
        }
        
        try {
            $pdo = self::$connections[$connectionKey];
            $pdo->query('SELECT 1');
            return true;
        } catch (PDOException $e) {
            return false;
        }
    }
    
    /**
     * Execute a query with automatic tenant context
     */
    public static function executeWithTenant(string $tenantId, string $sql, array $params = []): \PDOStatement
    {
        $pdo = self::getConnection($tenantId);
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }
    
    /**
     * Begin transaction for a tenant
     */
    public static function beginTransaction(string $tenantId): bool
    {
        return self::getConnection($tenantId)->beginTransaction();
    }
    
    /**
     * Commit transaction for a tenant
     */
    public static function commit(string $tenantId): bool
    {
        return self::getConnection($tenantId)->commit();
    }
    
    /**
     * Rollback transaction for a tenant
     */
    public static function rollback(string $tenantId): bool
    {
        return self::getConnection($tenantId)->rollback();
    }
    
    /**
     * Close specific tenant connection
     */
    public static function closeConnection(string $tenantId): void
    {
        $connectionKey = "tenant_{$tenantId}";
        if (isset(self::$connections[$connectionKey])) {
            self::$connections[$connectionKey] = null;
            unset(self::$connections[$connectionKey]);
        }
    }
    
    /**
     * Close all connections
     */
    public static function closeAllConnections(): void
    {
        foreach (array_keys(self::$connections) as $connectionKey) {
            self::$connections[$connectionKey] = null;
        }
        self::$connections = [];
    }
    
    /**
     * Get available tenant IDs
     */
    public static function getAvailableTenants(): array
    {
        self::initialize();
        return array_keys(self::$tenantConfigs);
    }
    
    /**
     * Validate tenant exists and is accessible
     */
    public static function validateTenant(string $tenantId): bool
    {
        self::initialize();
        
        if (!isset(self::$tenantConfigs[$tenantId])) {
            return false;
        }
        
        try {
            self::getConnection($tenantId);
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }
    
    /**
     * Get connection statistics
     */
    public static function getConnectionStats(): array
    {
        return [
            'active_connections' => count(self::$connections),
            'available_tenants' => count(self::$tenantConfigs),
            'connections' => array_keys(self::$connections),
        ];
    }
}
