<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Services\SecurityService;

class SecurityController
{
    private SecurityService $securityService;

    public function __construct()
    {
        $this->securityService = new SecurityService();
    }

    public function getAuditLogs(Request $request, Response $response, array $args): Response
    {
        try {
            $tenant = $request->getHeaderLine('X-Tenant') ?: 'test';
            $queryParams = $request->getQueryParams();
            
            $filters = [
                'severity' => $queryParams['severity'] ?? null,
                'dateRange' => $queryParams['dateRange'] ?? '7days',
                'search' => $queryParams['search'] ?? null,
                'limit' => (int)($queryParams['limit'] ?? 50),
                'offset' => (int)($queryParams['offset'] ?? 0)
            ];

            $logs = $this->securityService->getAuditLogs($tenant, $filters);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $logs
            ]));
            
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]));
            
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function createAuditLog(Request $request, Response $response, array $args): Response
    {
        try {
            $tenant = $request->getHeaderLine('X-Tenant') ?: 'test';
            $data = json_decode($request->getBody()->getContents(), true);

            $logId = $this->securityService->createAuditLog($tenant, $data);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => ['id' => $logId]
            ]));
            
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]));
            
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function getSecurityAlerts(Request $request, Response $response, array $args): Response
    {
        try {
            $tenant = $request->getHeaderLine('X-Tenant') ?: 'test';
            $queryParams = $request->getQueryParams();
            
            $filters = [
                'status' => $queryParams['status'] ?? null,
                'severity' => $queryParams['severity'] ?? null,
                'type' => $queryParams['type'] ?? null,
                'limit' => (int)($queryParams['limit'] ?? 50)
            ];

            $alerts = $this->securityService->getSecurityAlerts($tenant, $filters);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $alerts
            ]));
            
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]));
            
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function updateAlertStatus(Request $request, Response $response, array $args): Response
    {
        try {
            $tenant = $request->getHeaderLine('X-Tenant') ?: 'test';
            $alertId = (int)$args['id'];
            $data = json_decode($request->getBody()->getContents(), true);

            $this->securityService->updateAlertStatus($tenant, $alertId, $data['status'], $data['notes'] ?? null);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'Alert status updated successfully'
            ]));
            
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]));
            
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function getComplianceReports(Request $request, Response $response, array $args): Response
    {
        try {
            $tenant = $request->getHeaderLine('X-Tenant') ?: 'test';

            $reports = $this->securityService->getComplianceReports($tenant);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $reports
            ]));
            
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]));
            
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function runComplianceCheck(Request $request, Response $response, array $args): Response
    {
        try {
            $tenant = $request->getHeaderLine('X-Tenant') ?: 'test';
            $type = $args['type'] ?? null;

            $result = $this->securityService->runComplianceCheck($tenant, $type);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $result
            ]));
            
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]));
            
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function getSecurityStats(Request $request, Response $response, array $args): Response
    {
        try {
            $tenant = $request->getHeaderLine('X-Tenant') ?: 'test';

            $stats = $this->securityService->getSecurityStats($tenant);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $stats
            ]));
            
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]));
            
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function getEncryptionStatus(Request $request, Response $response, array $args): Response
    {
        try {
            $tenant = $request->getHeaderLine('X-Tenant') ?: 'test';

            $status = $this->securityService->getEncryptionStatus($tenant);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $status
            ]));
            
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]));
            
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function exportSecurityReport(Request $request, Response $response, array $args): Response
    {
        try {
            $tenant = $request->getHeaderLine('X-Tenant') ?: 'test';
            $queryParams = $request->getQueryParams();
            
            $options = [
                'type' => $queryParams['type'] ?? 'audit_logs',
                'format' => $queryParams['format'] ?? 'pdf',
                'dateRange' => $queryParams['dateRange'] ?? '30days'
            ];

            $reportData = $this->securityService->exportSecurityReport($tenant, $options);
            
            // Set appropriate headers for file download
            $filename = "security_report_" . date('Y-m-d') . "." . $options['format'];
            
            return $response
                ->withHeader('Content-Type', $this->getContentType($options['format']))
                ->withHeader('Content-Disposition', "attachment; filename=\"$filename\"")
                ->withBody($reportData);
                
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]));
            
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    private function getContentType(string $format): string
    {
        switch ($format) {
            case 'pdf':
                return 'application/pdf';
            case 'csv':
                return 'text/csv';
            case 'xlsx':
                return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            default:
                return 'application/octet-stream';
        }
    }
}
