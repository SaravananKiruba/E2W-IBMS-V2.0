<?php

namespace App\Services;

use App\Database\EnhancedDatabaseManager;
use App\Exceptions\ValidationException;
use App\Traits\AuditableTrait;
use App\Utils\ValidationUtils;

class EnhancedClientService
{
    use AuditableTrait;
    
    private string $tenantId;
    
    public function __construct(string $tenantId = null)
    {
        $this->tenantId = $tenantId;
    }
    
    /**
     * Get paginated clients with advanced filtering
     */
    public function getClients(array $params = []): array
    {
        $db = EnhancedDatabaseManager::getConnection($this->tenantId);
        
        $page = max(1, (int)($params['page'] ?? 1));
        $limit = min(100, max(10, (int)($params['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;
        
        // Build dynamic WHERE clause
        [$whereClause, $bindings] = $this->buildClientFilters($params);
        
        // Get total count
        $countSql = "
            SELECT COUNT(*) as total 
            FROM clients 
            WHERE tenant_id = :tenant_id AND deleted_at IS NULL AND {$whereClause}
        ";
        
        $bindings['tenant_id'] = $this->tenantId;
        $stmt = $db->prepare($countSql);
        $stmt->execute($bindings);
        $total = $stmt->fetch()['total'];
        
        // Get paginated data with joins
        $sql = "
            SELECT 
                c.*,
                CONCAT(c.first_name, ' ', c.last_name) as full_name,
                u1.first_name as assigned_to_name,
                u2.first_name as created_by_name,
                (SELECT COUNT(*) FROM orders WHERE client_id = c.id AND deleted_at IS NULL) as total_orders,
                (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE client_id = c.id AND deleted_at IS NULL) as lifetime_value,
                (SELECT MAX(order_date) FROM orders WHERE client_id = c.id AND deleted_at IS NULL) as last_order_date
            FROM clients c
            LEFT JOIN users u1 ON c.assigned_to = u1.id
            LEFT JOIN users u2 ON c.created_by = u2.id
            WHERE c.tenant_id = :tenant_id AND c.deleted_at IS NULL AND {$whereClause}
            ORDER BY " . $this->buildOrderClause($params) . "
            LIMIT :limit OFFSET :offset
        ";
        
        $bindings['limit'] = $limit;
        $bindings['offset'] = $offset;
        
        $stmt = $db->prepare($sql);
        $stmt->execute($bindings);
        $clients = $stmt->fetchAll();
        
        return [
            'data' => array_map([$this, 'formatClientResponse'], $clients),
            'pagination' => [
                'total' => (int)$total,
                'page' => $page,
                'limit' => $limit,
                'pages' => ceil($total / $limit),
                'has_next' => $page < ceil($total / $limit),
                'has_prev' => $page > 1
            ]
        ];
    }
    
    /**
     * Get single client with detailed information
     */
    public function getClient(string $clientId): ?array
    {
        $db = EnhancedDatabaseManager::getConnection($this->tenantId);
        
        $sql = "
            SELECT 
                c.*,
                CONCAT(c.first_name, ' ', c.last_name) as full_name,
                u1.first_name as assigned_to_name,
                u2.first_name as created_by_name
            FROM clients c
            LEFT JOIN users u1 ON c.assigned_to = u1.id
            LEFT JOIN users u2 ON c.created_by = u2.id
            WHERE c.tenant_id = :tenant_id AND (c.id = :id OR c.uuid = :uuid) AND c.deleted_at IS NULL
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([
            'tenant_id' => $this->tenantId,
            'id' => is_numeric($clientId) ? $clientId : 0,
            'uuid' => $clientId
        ]);
        
        $client = $stmt->fetch();
        if (!$client) {
            return null;
        }
        
        // Get client statistics
        $stats = $this->getClientStatistics($client['id']);
        $client['statistics'] = $stats;
        
        // Get recent orders
        $recentOrders = $this->getClientRecentOrders($client['id'], 5);
        $client['recent_orders'] = $recentOrders;
        
        return $this->formatClientResponse($client);
    }
    
    /**
     * Create new client with validation
     */
    public function createClient(array $data, int $userId): array
    {
        // Validate input data
        $this->validateClientData($data);
        
        $db = EnhancedDatabaseManager::getConnection($this->tenantId);
        
        // Check for duplicate email or phone
        $this->checkClientDuplicates($data);
        
        // Generate client code if not provided
        if (empty($data['client_code'])) {
            $data['client_code'] = $this->generateClientCode();
        }
        
        $uuid = $this->generateUUID();
        
        try {
            $db->beginTransaction();
            
            $sql = "
                INSERT INTO clients (
                    uuid, tenant_id, client_code, company_name, contact_person,
                    email, phone, mobile, address, city, state, country, postal_code,
                    gst_number, pan_number, client_type, industry, source,
                    assigned_to, credit_limit, payment_terms, status, notes,
                    metadata, created_by
                ) VALUES (
                    :uuid, :tenant_id, :client_code, :company_name, :contact_person,
                    :email, :phone, :mobile, :address, :city, :state, :country, :postal_code,
                    :gst_number, :pan_number, :client_type, :industry, :source,
                    :assigned_to, :credit_limit, :payment_terms, :status, :notes,
                    :metadata, :created_by
                )
            ";
            
            $stmt = $db->prepare($sql);
            $stmt->execute([
                'uuid' => $uuid,
                'tenant_id' => $this->tenantId,
                'client_code' => $data['client_code'],
                'company_name' => $data['company_name'] ?? null,
                'contact_person' => $data['contact_person'] ?? null,
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,
                'mobile' => $data['mobile'] ?? null,
                'address' => $data['address'] ?? null,
                'city' => $data['city'] ?? null,
                'state' => $data['state'] ?? null,
                'country' => $data['country'] ?? 'India',
                'postal_code' => $data['postal_code'] ?? null,
                'gst_number' => $data['gst_number'] ?? null,
                'pan_number' => $data['pan_number'] ?? null,
                'client_type' => $data['client_type'] ?? 'business',
                'industry' => $data['industry'] ?? null,
                'source' => $data['source'] ?? 'direct',
                'assigned_to' => $data['assigned_to'] ?? null,
                'credit_limit' => $data['credit_limit'] ?? 0,
                'payment_terms' => $data['payment_terms'] ?? null,
                'status' => $data['status'] ?? 'active',
                'notes' => $data['notes'] ?? null,
                'metadata' => json_encode($data['metadata'] ?? []),
                'created_by' => $userId
            ]);
            
            $clientId = $db->lastInsertId();
            
            // Log audit trail
            $this->logAudit($this->tenantId, $userId, 'create', 'client', $clientId, null, $data);
            
            $db->commit();
            
            return [
                'id' => $clientId,
                'uuid' => $uuid,
                'client_code' => $data['client_code'],
                'status' => 'created'
            ];
            
        } catch (\Exception $e) {
            $db->rollback();
            throw $e;
        }
    }
    
    /**
     * Update client with change tracking
     */
    public function updateClient(string $clientId, array $data, int $userId): bool
    {
        // Get current client data for audit
        $currentClient = $this->getClient($clientId);
        if (!$currentClient) {
            throw new \InvalidArgumentException('Client not found');
        }
        
        // Validate update data
        $this->validateClientData($data, true);
        
        $db = EnhancedDatabaseManager::getConnection($this->tenantId);
        
        // Build dynamic update query
        $updateFields = [];
        $bindings = [];
        
        $allowedFields = [
            'company_name', 'contact_person', 'email', 'phone', 'mobile',
            'address', 'city', 'state', 'country', 'postal_code',
            'gst_number', 'pan_number', 'client_type', 'industry',
            'source', 'assigned_to', 'credit_limit', 'payment_terms',
            'status', 'notes', 'metadata'
        ];
        
        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $data)) {
                $updateFields[] = "{$field} = :{$field}";
                $bindings[$field] = $field === 'metadata' ? json_encode($data[$field]) : $data[$field];
            }
        }
        
        if (empty($updateFields)) {
            return false;
        }
        
        try {
            $db->beginTransaction();
            
            $sql = "
                UPDATE clients 
                SET " . implode(', ', $updateFields) . ", updated_at = NOW()
                WHERE tenant_id = :tenant_id AND (id = :id OR uuid = :uuid) AND deleted_at IS NULL
            ";
            
            $bindings['tenant_id'] = $this->tenantId;
            $bindings['id'] = is_numeric($clientId) ? $clientId : 0;
            $bindings['uuid'] = $clientId;
            
            $stmt = $db->prepare($sql);
            $stmt->execute($bindings);
            
            if ($stmt->rowCount() > 0) {
                // Log audit trail with changes
                $this->logAudit($this->tenantId, $userId, 'update', 'client', $currentClient['id'], $currentClient, $data);
                
                $db->commit();
                return true;
            }
            
            $db->rollback();
            return false;
            
        } catch (\Exception $e) {
            $db->rollback();
            throw $e;
        }
    }
    
    /**
     * Soft delete client
     */
    public function deleteClient(string $clientId, int $userId): bool
    {
        $client = $this->getClient($clientId);
        if (!$client) {
            return false;
        }
        
        // Check if client has active orders
        if ($this->hasActiveOrders($client['id'])) {
            throw new \InvalidArgumentException('Cannot delete client with active orders');
        }
        
        $db = EnhancedDatabaseManager::getConnection($this->tenantId);
        
        $sql = "
            UPDATE clients 
            SET deleted_at = NOW()
            WHERE tenant_id = :tenant_id AND (id = :id OR uuid = :uuid)
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([
            'tenant_id' => $this->tenantId,
            'id' => is_numeric($clientId) ? $clientId : 0,
            'uuid' => $clientId
        ]);
        
        if ($stmt->rowCount() > 0) {
            $this->logAudit($this->tenantId, $userId, 'delete', 'client', $client['id'], $client, null);
            return true;
        }
        
        return false;
    }
    
    /**
     * Get client statistics
     */
    private function getClientStatistics(int $clientId): array
    {
        $db = EnhancedDatabaseManager::getConnection($this->tenantId);
        
        $sql = "
            SELECT 
                COUNT(*) as total_orders,
                COALESCE(SUM(total_amount), 0) as lifetime_value,
                COALESCE(SUM(paid_amount), 0) as total_paid,
                COALESCE(SUM(balance_amount), 0) as outstanding_balance,
                COALESCE(AVG(total_amount), 0) as average_order_value,
                MAX(order_date) as last_order_date,
                MIN(order_date) as first_order_date
            FROM orders 
            WHERE tenant_id = :tenant_id AND client_id = :client_id AND deleted_at IS NULL
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([
            'tenant_id' => $this->tenantId,
            'client_id' => $clientId
        ]);
        
        return $stmt->fetch();
    }
    
    /**
     * Get client's recent orders
     */
    private function getClientRecentOrders(int $clientId, int $limit = 5): array
    {
        $db = EnhancedDatabaseManager::getConnection($this->tenantId);
        
        $sql = "
            SELECT order_number, order_date, status, total_amount, payment_status
            FROM orders 
            WHERE tenant_id = :tenant_id AND client_id = :client_id AND deleted_at IS NULL
            ORDER BY order_date DESC
            LIMIT :limit
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->bindValue('tenant_id', $this->tenantId);
        $stmt->bindValue('client_id', $clientId);
        $stmt->bindValue('limit', $limit, \PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll();
    }
    
    /**
     * Build filter conditions for client queries
     */
    private function buildClientFilters(array $params): array
    {
        $conditions = ['1=1'];
        $bindings = [];
        
        // Search functionality
        if (!empty($params['search'])) {
            $conditions[] = "(
                company_name LIKE :search OR 
                contact_person LIKE :search OR 
                email LIKE :search OR 
                phone LIKE :search OR 
                client_code LIKE :search
            )";
            $bindings['search'] = '%' . $params['search'] . '%';
        }
        
        // Status filter
        if (!empty($params['status'])) {
            $conditions[] = "status = :status";
            $bindings['status'] = $params['status'];
        }
        
        // Client type filter
        if (!empty($params['client_type'])) {
            $conditions[] = "client_type = :client_type";
            $bindings['client_type'] = $params['client_type'];
        }
        
        // Industry filter
        if (!empty($params['industry'])) {
            $conditions[] = "industry = :industry";
            $bindings['industry'] = $params['industry'];
        }
        
        // Assigned to filter
        if (!empty($params['assigned_to'])) {
            $conditions[] = "assigned_to = :assigned_to";
            $bindings['assigned_to'] = $params['assigned_to'];
        }
        
        // Date range filters
        if (!empty($params['created_from'])) {
            $conditions[] = "DATE(created_at) >= :created_from";
            $bindings['created_from'] = $params['created_from'];
        }
        
        if (!empty($params['created_to'])) {
            $conditions[] = "DATE(created_at) <= :created_to";
            $bindings['created_to'] = $params['created_to'];
        }
        
        return [implode(' AND ', $conditions), $bindings];
    }
    
    /**
     * Build order clause for sorting
     */
    private function buildOrderClause(array $params): string
    {
        $sortField = $params['sort'] ?? 'created_at';
        $sortDirection = strtoupper($params['direction'] ?? 'DESC');
        
        $allowedFields = [
            'company_name', 'contact_person', 'email', 'created_at', 
            'updated_at', 'status', 'client_type', 'lifetime_value'
        ];
        
        if (!in_array($sortField, $allowedFields)) {
            $sortField = 'created_at';
        }
        
        if (!in_array($sortDirection, ['ASC', 'DESC'])) {
            $sortDirection = 'DESC';
        }
        
        return "c.{$sortField} {$sortDirection}";
    }
    
    /**
     * Validate client data
     */
    private function validateClientData(array $data, bool $isUpdate = false): void
    {
        if (!$isUpdate && empty($data['company_name']) && empty($data['contact_person'])) {
            throw new ValidationException('Either company name or contact person is required');
        }
        
        if (!empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new ValidationException('Invalid email format');
        }
        
        if (!empty($data['gst_number']) && !$this->validateGstNumber($data['gst_number'])) {
            throw new ValidationException('Invalid GST number format');
        }
        
        if (!empty($data['pan_number']) && !$this->validatePanNumber($data['pan_number'])) {
            throw new ValidationException('Invalid PAN number format');
        }
        
        if (!empty($data['credit_limit']) && !is_numeric($data['credit_limit'])) {
            throw new ValidationException('Credit limit must be a valid number');
        }
    }
    
    /**
     * Check for duplicate clients
     */
    private function checkClientDuplicates(array $data): void
    {
        $db = EnhancedDatabaseManager::getConnection($this->tenantId);
        
        $conditions = [];
        $bindings = ['tenant_id' => $this->tenantId];
        
        if (!empty($data['email'])) {
            $conditions[] = "email = :email";
            $bindings['email'] = $data['email'];
        }
        
        if (!empty($data['gst_number'])) {
            $conditions[] = "gst_number = :gst_number";
            $bindings['gst_number'] = $data['gst_number'];
        }
        
        if (!empty($conditions)) {
            $sql = "
                SELECT id, email, gst_number 
                FROM clients 
                WHERE tenant_id = :tenant_id AND deleted_at IS NULL AND (" . implode(' OR ', $conditions) . ")
            ";
            
            $stmt = $db->prepare($sql);
            $stmt->execute($bindings);
            
            if ($existing = $stmt->fetch()) {
                if ($existing['email'] === ($data['email'] ?? null)) {
                    throw new ValidationException('Client with this email already exists');
                }
                if ($existing['gst_number'] === ($data['gst_number'] ?? null)) {
                    throw new ValidationException('Client with this GST number already exists');
                }
            }
        }
    }
    
    /**
     * Generate unique client code
     */
    private function generateClientCode(): string
    {
        $db = EnhancedDatabaseManager::getConnection($this->tenantId);
        
        do {
            $code = 'CL' . str_pad(mt_rand(1, 99999), 5, '0', STR_PAD_LEFT);
            
            $stmt = $db->prepare("
                SELECT id FROM clients 
                WHERE tenant_id = :tenant_id AND client_code = :code
            ");
            $stmt->execute(['tenant_id' => $this->tenantId, 'code' => $code]);
            
        } while ($stmt->fetch());
        
        return $code;
    }
    
    /**
     * Check if client has active orders
     */
    private function hasActiveOrders(int $clientId): bool
    {
        $db = EnhancedDatabaseManager::getConnection($this->tenantId);
        
        $stmt = $db->prepare("
            SELECT COUNT(*) as count 
            FROM orders 
            WHERE tenant_id = :tenant_id AND client_id = :client_id 
                  AND status NOT IN ('completed', 'cancelled') AND deleted_at IS NULL
        ");
        $stmt->execute(['tenant_id' => $this->tenantId, 'client_id' => $clientId]);
        
        return $stmt->fetch()['count'] > 0;
    }
    
    /**
     * Format client response data
     */
    private function formatClientResponse(array $client): array
    {
        return [
            'id' => (int)$client['id'],
            'uuid' => $client['uuid'],
            'client_code' => $client['client_code'],
            'company_name' => $client['company_name'],
            'contact_person' => $client['contact_person'],
            'full_name' => $client['full_name'] ?? $client['contact_person'] ?? $client['company_name'],
            'email' => $client['email'],
            'phone' => $client['phone'],
            'mobile' => $client['mobile'],
            'address' => $client['address'],
            'city' => $client['city'],
            'state' => $client['state'],
            'country' => $client['country'],
            'postal_code' => $client['postal_code'],
            'gst_number' => $client['gst_number'],
            'pan_number' => $client['pan_number'],
            'client_type' => $client['client_type'],
            'industry' => $client['industry'],
            'source' => $client['source'],
            'assigned_to' => $client['assigned_to'] ? [
                'id' => $client['assigned_to'],
                'name' => $client['assigned_to_name']
            ] : null,
            'credit_limit' => (float)$client['credit_limit'],
            'payment_terms' => $client['payment_terms'],
            'status' => $client['status'],
            'notes' => $client['notes'],
            'metadata' => json_decode($client['metadata'] ?? '{}', true),
            'statistics' => $client['statistics'] ?? null,
            'recent_orders' => $client['recent_orders'] ?? null,
            'total_orders' => (int)($client['total_orders'] ?? 0),
            'lifetime_value' => (float)($client['lifetime_value'] ?? 0),
            'last_order_date' => $client['last_order_date'],
            'created_by' => $client['created_by'] ? [
                'id' => $client['created_by'],
                'name' => $client['created_by_name']
            ] : null,
            'created_at' => $client['created_at'],
            'updated_at' => $client['updated_at']
        ];
    }
    
    /**
     * Validate GST number format
     */
    private function validateGstNumber(string $gst): bool
    {
        // GST format: 2 digits state code + 10 digit PAN + 1 digit entity number + 1 digit Z + 1 digit checksum
        return preg_match('/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/', $gst);
    }
    
    /**
     * Validate PAN number format
     */
    private function validatePanNumber(string $pan): bool
    {
        // PAN format: 5 letters + 4 digits + 1 letter
        return preg_match('/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/', $pan);
    }
    
    /**
     * Generate UUID
     */
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
}
