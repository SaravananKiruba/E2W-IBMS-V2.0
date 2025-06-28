<?php

namespace App\Services;

use App\Database\DatabaseManager;
use PDO;

class SecurityService
{
    private DatabaseManager $dbManager;

    public function __construct()
    {
        $this->dbManager = new DatabaseManager();
    }

    public function getAuditLogs(string $tenant, array $filters = []): array
    {
        $pdo = $this->dbManager->getConnection($tenant);
        
        $sql = "SELECT al.*, u.userName as user_name 
                FROM audit_logs al 
                LEFT JOIN user_table u ON al.user_id = u.id 
                WHERE 1=1";
        
        $params = [];
        
        if (!empty($filters['severity'])) {
            $sql .= " AND al.severity = :severity";
            $params['severity'] = $filters['severity'];
        }
        
        if (!empty($filters['search'])) {
            $sql .= " AND (al.action LIKE :search OR al.resource LIKE :search OR al.details LIKE :search)";
            $params['search'] = '%' . $filters['search'] . '%';
        }
        
        // Date range filter
        if (!empty($filters['dateRange'])) {
            $dateCondition = $this->getDateRangeCondition($filters['dateRange']);
            if ($dateCondition) {
                $sql .= " AND al.created_at >= :date_from";
                $params['date_from'] = $dateCondition;
            }
        }
        
        $sql .= " ORDER BY al.created_at DESC";
        
        if (!empty($filters['limit'])) {
            $sql .= " LIMIT :limit";
            if (!empty($filters['offset'])) {
                $sql .= " OFFSET :offset";
            }
        }
        
        $stmt = $pdo->prepare($sql);
        
        // Bind parameters with proper types
        foreach ($params as $key => $value) {
            if ($key === 'limit' || $key === 'offset') {
                $stmt->bindValue(":$key", $value, PDO::PARAM_INT);
            } else {
                $stmt->bindValue(":$key", $value);
            }
        }
        
        if (!empty($filters['limit'])) {
            $stmt->bindValue(':limit', (int)$filters['limit'], PDO::PARAM_INT);
            if (!empty($filters['offset'])) {
                $stmt->bindValue(':offset', (int)$filters['offset'], PDO::PARAM_INT);
            }
        }
        
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createAuditLog(string $tenant, array $data): int
    {
        $pdo = $this->dbManager->getConnection($tenant);
        
        $sql = "INSERT INTO audit_logs (user_id, action, resource, details, ip_address, user_agent, severity, status, created_at) 
                VALUES (:user_id, :action, :resource, :details, :ip_address, :user_agent, :severity, :status, NOW())";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'user_id' => $data['userId'] ?? 0,
            'action' => $data['action'],
            'resource' => $data['resource'],
            'details' => $data['details'],
            'ip_address' => $data['ipAddress'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $data['userAgent'] ?? $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'severity' => $data['severity'] ?? 'medium',
            'status' => $data['status'] ?? 'success'
        ]);
        
        return $pdo->lastInsertId();
    }

    public function getSecurityAlerts(string $tenant, array $filters = []): array
    {
        $pdo = $this->dbManager->getConnection($tenant);
        
        $sql = "SELECT sa.*, u.userName as user_name 
                FROM security_alerts sa 
                LEFT JOIN user_table u ON sa.user_id = u.id 
                WHERE 1=1";
        
        $params = [];
        
        if (!empty($filters['status'])) {
            $sql .= " AND sa.status = :status";
            $params['status'] = $filters['status'];
        }
        
        if (!empty($filters['severity'])) {
            $sql .= " AND sa.severity = :severity";
            $params['severity'] = $filters['severity'];
        }
        
        if (!empty($filters['type'])) {
            $sql .= " AND sa.type = :type";
            $params['type'] = $filters['type'];
        }
        
        $sql .= " ORDER BY sa.created_at DESC";
        
        if (!empty($filters['limit'])) {
            $sql .= " LIMIT :limit";
            $params['limit'] = (int)$filters['limit'];
        }
        
        $stmt = $pdo->prepare($sql);
        
        foreach ($params as $key => $value) {
            if ($key === 'limit') {
                $stmt->bindValue(":$key", $value, PDO::PARAM_INT);
            } else {
                $stmt->bindValue(":$key", $value);
            }
        }
        
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function updateAlertStatus(string $tenant, int $alertId, string $status, ?string $notes = null): bool
    {
        $pdo = $this->dbManager->getConnection($tenant);
        
        $sql = "UPDATE security_alerts SET status = :status, resolution_notes = :notes, updated_at = NOW() 
                WHERE id = :alert_id";
        
        $stmt = $pdo->prepare($sql);
        return $stmt->execute([
            'status' => $status,
            'notes' => $notes,
            'alert_id' => $alertId
        ]);
    }

    public function getComplianceReports(string $tenant): array
    {
        // Mock compliance reports data
        // In a real implementation, this would check various compliance metrics
        return [
            [
                'id' => 1,
                'name' => 'GDPR Compliance',
                'type' => 'gdpr',
                'status' => 'compliant',
                'last_check' => date('Y-m-d H:i:s'),
                'score' => 95,
                'issues' => 0
            ],
            [
                'id' => 2,
                'name' => 'Data Retention Policy',
                'type' => 'data_retention',
                'status' => 'needs_attention',
                'last_check' => date('Y-m-d H:i:s'),
                'score' => 87,
                'issues' => 2
            ],
            [
                'id' => 3,
                'name' => 'Access Control Review',
                'type' => 'access_control',
                'status' => 'compliant',
                'last_check' => date('Y-m-d H:i:s'),
                'score' => 98,
                'issues' => 0
            ],
            [
                'id' => 4,
                'name' => 'Audit Trail Integrity',
                'type' => 'audit_trail',
                'status' => 'compliant',
                'last_check' => date('Y-m-d H:i:s'),
                'score' => 100,
                'issues' => 0
            ]
        ];
    }

    public function runComplianceCheck(string $tenant, ?string $type = null): array
    {
        // Mock compliance check results
        // In a real implementation, this would run actual compliance checks
        return [
            'check_id' => uniqid(),
            'type' => $type ?? 'all',
            'status' => 'completed',
            'score' => rand(85, 100),
            'issues_found' => rand(0, 3),
            'recommendations' => [
                'Enable two-factor authentication for all users',
                'Review and update password policies',
                'Conduct security awareness training'
            ],
            'completed_at' => date('Y-m-d H:i:s')
        ];
    }

    public function getSecurityStats(string $tenant): array
    {
        $pdo = $this->dbManager->getConnection($tenant);
        
        // Get audit log stats
        $auditStmt = $pdo->prepare("SELECT COUNT(*) as total_logs FROM audit_logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
        $auditStmt->execute();
        $totalLogs = $auditStmt->fetch(PDO::FETCH_ASSOC)['total_logs'];
        
        // Get critical alerts
        $alertStmt = $pdo->prepare("SELECT COUNT(*) as critical_alerts FROM security_alerts WHERE severity = 'critical' AND status != 'resolved'");
        $alertStmt->execute();
        $criticalAlerts = $alertStmt->fetch(PDO::FETCH_ASSOC)['critical_alerts'];
        
        // Get failed login attempts
        $loginStmt = $pdo->prepare("SELECT COUNT(*) as failed_logins FROM audit_logs WHERE action = 'LOGIN_FAILURE' AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)");
        $loginStmt->execute();
        $failedLogins = $loginStmt->fetch(PDO::FETCH_ASSOC)['failed_logins'];
        
        return [
            'total_logs' => (int)$totalLogs,
            'critical_alerts' => (int)$criticalAlerts,
            'active_incidents' => rand(0, 2),
            'compliance_score' => rand(85, 98),
            'last_security_scan' => date('Y-m-d H:i:s'),
            'login_attempts' => rand(100, 200),
            'failed_logins' => (int)$failedLogins,
            'data_access' => rand(500, 1000)
        ];
    }

    public function getEncryptionStatus(string $tenant): array
    {
        // Mock encryption status data
        // In a real implementation, this would check actual encryption settings
        return [
            'database_encryption' => [
                'enabled' => true,
                'algorithm' => 'AES-256',
                'status' => 'active'
            ],
            'api_communication' => [
                'enabled' => true,
                'protocol' => 'TLS 1.3',
                'status' => 'active'
            ],
            'file_storage' => [
                'enabled' => true,
                'algorithm' => 'AES-256',
                'status' => 'active'
            ],
            'backup_encryption' => [
                'enabled' => true,
                'algorithm' => 'AES-256',
                'status' => 'active'
            ],
            'access_control' => [
                'mfa_enabled' => true,
                'session_timeout' => 30,
                'password_policy' => 'strong',
                'ip_restrictions' => 'partial'
            ]
        ];
    }

    public function exportSecurityReport(string $tenant, array $options): string
    {
        // Mock report generation
        // In a real implementation, this would generate actual reports in the requested format
        $reportData = [
            'title' => 'Security Report',
            'tenant' => $tenant,
            'generated_at' => date('Y-m-d H:i:s'),
            'type' => $options['type'],
            'date_range' => $options['dateRange'],
            'data' => []
        ];
        
        switch ($options['type']) {
            case 'audit_logs':
                $reportData['data'] = $this->getAuditLogs($tenant, ['limit' => 1000]);
                break;
            case 'security_alerts':
                $reportData['data'] = $this->getSecurityAlerts($tenant, ['limit' => 100]);
                break;
            case 'compliance':
                $reportData['data'] = $this->getComplianceReports($tenant);
                break;
        }
        
        // Convert to requested format
        switch ($options['format']) {
            case 'json':
                return json_encode($reportData, JSON_PRETTY_PRINT);
            case 'csv':
                return $this->convertToCSV($reportData['data']);
            case 'pdf':
                return $this->generatePDFReport($reportData);
            default:
                return json_encode($reportData, JSON_PRETTY_PRINT);
        }
    }

    private function getDateRangeCondition(string $range): ?string
    {
        switch ($range) {
            case '1day':
                return date('Y-m-d H:i:s', strtotime('-1 day'));
            case '7days':
                return date('Y-m-d H:i:s', strtotime('-7 days'));
            case '30days':
                return date('Y-m-d H:i:s', strtotime('-30 days'));
            case '90days':
                return date('Y-m-d H:i:s', strtotime('-90 days'));
            default:
                return null;
        }
    }

    private function convertToCSV(array $data): string
    {
        if (empty($data)) {
            return '';
        }
        
        $output = '';
        $headers = array_keys($data[0]);
        $output .= implode(',', $headers) . "\n";
        
        foreach ($data as $row) {
            $output .= implode(',', array_map(function($value) {
                return '"' . str_replace('"', '""', $value) . '"';
            }, $row)) . "\n";
        }
        
        return $output;
    }

    private function generatePDFReport(array $data): string
    {
        // Mock PDF generation
        // In a real implementation, this would use a PDF library like TCPDF or mPDF
        return "Mock PDF report content for: " . $data['title'];
    }

    public function logSecurityEvent(string $tenant, array $eventData): void
    {
        // Check if this event should trigger an alert
        $this->checkForSecurityThreats($tenant, $eventData);
        
        // Log the event
        $this->createAuditLog($tenant, $eventData);
    }

    private function checkForSecurityThreats(string $tenant, array $eventData): void
    {
        // Check for potential security threats and create alerts
        if ($eventData['action'] === 'LOGIN_FAILURE') {
            $this->checkForBruteForceAttack($tenant, $eventData);
        }
        
        if ($eventData['action'] === 'DATA_ACCESS' && isset($eventData['volume']) && $eventData['volume'] > 1000) {
            $this->createSecurityAlert($tenant, [
                'type' => 'data_access',
                'title' => 'Unusual Data Access Pattern',
                'description' => 'Large volume of data accessed by user',
                'severity' => 'medium',
                'user_id' => $eventData['userId'] ?? null
            ]);
        }
    }

    private function checkForBruteForceAttack(string $tenant, array $eventData): void
    {
        $pdo = $this->dbManager->getConnection($tenant);
        
        // Count recent failed login attempts from the same IP
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as failed_count 
            FROM audit_logs 
            WHERE action = 'LOGIN_FAILURE' 
            AND ip_address = :ip_address 
            AND created_at >= DATE_SUB(NOW(), INTERVAL 15 MINUTE)
        ");
        
        $stmt->execute(['ip_address' => $eventData['ipAddress']]);
        $failedCount = $stmt->fetch(PDO::FETCH_ASSOC)['failed_count'];
        
        if ($failedCount >= 5) {
            $this->createSecurityAlert($tenant, [
                'type' => 'login_failure',
                'title' => 'Potential Brute Force Attack',
                'description' => "Multiple failed login attempts from IP: {$eventData['ipAddress']}",
                'severity' => 'high',
                'ip_address' => $eventData['ipAddress']
            ]);
        }
    }

    private function createSecurityAlert(string $tenant, array $alertData): int
    {
        $pdo = $this->dbManager->getConnection($tenant);
        
        $sql = "INSERT INTO security_alerts (type, title, description, severity, status, user_id, ip_address, created_at) 
                VALUES (:type, :title, :description, :severity, 'open', :user_id, :ip_address, NOW())";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'type' => $alertData['type'],
            'title' => $alertData['title'],
            'description' => $alertData['description'],
            'severity' => $alertData['severity'],
            'user_id' => $alertData['user_id'] ?? null,
            'ip_address' => $alertData['ip_address'] ?? null
        ]);
        
        return $pdo->lastInsertId();
    }
}
