<?php

use PHPUnit\Framework\TestCase;
use App\Services\SecurityService;

class SecurityServiceTest extends TestCase
{
    private SecurityService $securityService;

    protected function setUp(): void
    {
        $this->securityService = new SecurityService();
    }

    public function testGetAuditLogs(): void
    {
        $tenant = 'test';
        $filters = ['severity' => 'high', 'limit' => 10];
        
        $logs = $this->securityService->getAuditLogs($tenant, $filters);
        
        $this->assertIsArray($logs);
        // Add more specific assertions based on your expected data structure
    }

    public function testCreateAuditLog(): void
    {
        $tenant = 'test';
        $logData = [
            'userId' => 1,
            'action' => 'TEST_ACTION',
            'resource' => 'Test Resource',
            'details' => 'Test log entry',
            'severity' => 'medium',
            'status' => 'success'
        ];
        
        $logId = $this->securityService->createAuditLog($tenant, $logData);
        
        $this->assertIsInt($logId);
        $this->assertGreaterThan(0, $logId);
    }

    public function testGetSecurityAlerts(): void
    {
        $tenant = 'test';
        $filters = ['status' => 'open'];
        
        $alerts = $this->securityService->getSecurityAlerts($tenant, $filters);
        
        $this->assertIsArray($alerts);
    }

    public function testUpdateAlertStatus(): void
    {
        $tenant = 'test';
        $alertId = 1;
        $status = 'resolved';
        $notes = 'Test resolution notes';
        
        $result = $this->securityService->updateAlertStatus($tenant, $alertId, $status, $notes);
        
        $this->assertTrue($result);
    }

    public function testGetComplianceReports(): void
    {
        $tenant = 'test';
        
        $reports = $this->securityService->getComplianceReports($tenant);
        
        $this->assertIsArray($reports);
        $this->assertNotEmpty($reports);
        
        // Check the structure of the first report
        if (!empty($reports)) {
            $report = $reports[0];
            $this->assertArrayHasKey('id', $report);
            $this->assertArrayHasKey('name', $report);
            $this->assertArrayHasKey('type', $report);
            $this->assertArrayHasKey('status', $report);
            $this->assertArrayHasKey('score', $report);
        }
    }

    public function testRunComplianceCheck(): void
    {
        $tenant = 'test';
        $type = 'gdpr';
        
        $result = $this->securityService->runComplianceCheck($tenant, $type);
        
        $this->assertIsArray($result);
        $this->assertArrayHasKey('check_id', $result);
        $this->assertArrayHasKey('type', $result);
        $this->assertArrayHasKey('status', $result);
        $this->assertEquals($type, $result['type']);
    }

    public function testGetSecurityStats(): void
    {
        $tenant = 'test';
        
        $stats = $this->securityService->getSecurityStats($tenant);
        
        $this->assertIsArray($stats);
        $this->assertArrayHasKey('total_logs', $stats);
        $this->assertArrayHasKey('critical_alerts', $stats);
        $this->assertArrayHasKey('compliance_score', $stats);
        
        $this->assertIsInt($stats['total_logs']);
        $this->assertIsInt($stats['critical_alerts']);
        $this->assertIsInt($stats['compliance_score']);
    }

    public function testGetEncryptionStatus(): void
    {
        $tenant = 'test';
        
        $status = $this->securityService->getEncryptionStatus($tenant);
        
        $this->assertIsArray($status);
        $this->assertArrayHasKey('database_encryption', $status);
        $this->assertArrayHasKey('api_communication', $status);
        $this->assertArrayHasKey('file_storage', $status);
        $this->assertArrayHasKey('backup_encryption', $status);
        $this->assertArrayHasKey('access_control', $status);
    }

    public function testExportSecurityReport(): void
    {
        $tenant = 'test';
        $options = [
            'type' => 'audit_logs',
            'format' => 'json',
            'dateRange' => '7days'
        ];
        
        $report = $this->securityService->exportSecurityReport($tenant, $options);
        
        $this->assertIsString($report);
        $this->assertNotEmpty($report);
        
        // For JSON format, ensure it's valid JSON
        if ($options['format'] === 'json') {
            $decoded = json_decode($report, true);
            $this->assertIsArray($decoded);
        }
    }

    public function testLogSecurityEvent(): void
    {
        $tenant = 'test';
        $eventData = [
            'userId' => 1,
            'action' => 'LOGIN',
            'resource' => 'Authentication',
            'details' => 'User login successful',
            'severity' => 'low',
            'status' => 'success'
        ];
        
        // This should not throw any exceptions
        $this->securityService->logSecurityEvent($tenant, $eventData);
        
        // Since this method returns void, we just assert it doesn't throw
        $this->assertTrue(true);
    }
}
