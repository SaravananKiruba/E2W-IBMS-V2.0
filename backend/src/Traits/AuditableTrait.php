<?php

namespace App\Traits;

use App\Database\EnhancedDatabaseManager;

trait AuditableTrait
{
    /**
     * Log audit trail for entity changes
     */
    protected function logAudit(
        string $tenantId, 
        int $userId, 
        string $action, 
        string $entityType, 
        int $entityId, 
        ?array $oldValues = null, 
        ?array $newValues = null,
        ?string $description = null
    ): void {
        try {
            $sql = "
                INSERT INTO audit_logs (
                    tenant_id, user_id, action, entity_type, entity_id,
                    old_values, new_values, description, ip_address, user_agent
                ) VALUES (
                    :tenant_id, :user_id, :action, :entity_type, :entity_id,
                    :old_values, :new_values, :description, :ip_address, :user_agent
                )
            ";
            
            EnhancedDatabaseManager::executeWithTenant($tenantId, $sql, [
                'tenant_id' => $tenantId,
                'user_id' => $userId,
                'action' => $action,
                'entity_type' => $entityType,
                'entity_id' => $entityId,
                'old_values' => $oldValues ? json_encode($oldValues) : null,
                'new_values' => $newValues ? json_encode($newValues) : null,
                'description' => $description ?? ucfirst($action) . ' ' . $entityType,
                'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null
            ]);
        } catch (\Exception $e) {
            // Log audit failure but don't break the main operation
            error_log("Audit logging failed: " . $e->getMessage());
        }
    }
    
    /**
     * Get audit trail for an entity
     */
    protected function getAuditTrail(string $tenantId, string $entityType, int $entityId, int $limit = 50): array
    {
        $sql = "
            SELECT 
                al.*,
                CONCAT(u.first_name, ' ', u.last_name) as user_name
            FROM audit_logs al
            LEFT JOIN users u ON al.user_id = u.id
            WHERE al.tenant_id = :tenant_id 
                  AND al.entity_type = :entity_type 
                  AND al.entity_id = :entity_id
            ORDER BY al.created_at DESC
            LIMIT :limit
        ";
        
        $stmt = EnhancedDatabaseManager::executeWithTenant($tenantId, $sql, [
            'tenant_id' => $tenantId,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'limit' => $limit
        ]);
        
        return $stmt->fetchAll();
    }
}
