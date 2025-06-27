<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Services\DashboardService;

class DashboardController
{
    private DashboardService $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    public function getStats(Request $request, Response $response): Response
    {
        $tenant = $request->getAttribute('tenant');
        $params = $request->getQueryParams();
        
        try {
            $stats = $this->dashboardService->getStats($tenant, $params);
            
            $data = [
                'success' => true,
                'data' => $stats
            ];
            
            $response->getBody()->write(json_encode($data));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $error = [
                'success' => false,
                'message' => 'Failed to fetch dashboard stats',
                'error' => $e->getMessage()
            ];
            
            $response->getBody()->write(json_encode($error));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function getRecentActivity(Request $request, Response $response): Response
    {
        $tenant = $request->getAttribute('tenant');
        $params = $request->getQueryParams();
        
        try {
            $activity = $this->dashboardService->getRecentActivity($tenant, $params);
            
            $data = [
                'success' => true,
                'data' => $activity
            ];
            
            $response->getBody()->write(json_encode($data));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $error = [
                'success' => false,
                'message' => 'Failed to fetch recent activity',
                'error' => $e->getMessage()
            ];
            
            $response->getBody()->write(json_encode($error));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function getRevenueChart(Request $request, Response $response): Response
    {
        $tenant = $request->getAttribute('tenant');
        $params = $request->getQueryParams();
        
        try {
            $chartData = $this->dashboardService->getRevenueChart($tenant, $params);
            
            $data = [
                'success' => true,
                'data' => $chartData
            ];
            
            $response->getBody()->write(json_encode($data));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $error = [
                'success' => false,
                'message' => 'Failed to fetch revenue chart data',
                'error' => $e->getMessage()
            ];
            
            $response->getBody()->write(json_encode($error));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function getTopClients(Request $request, Response $response): Response
    {
        $tenant = $request->getAttribute('tenant');
        $params = $request->getQueryParams();
        
        try {
            $topClients = $this->dashboardService->getTopClients($tenant, $params);
            
            $data = [
                'success' => true,
                'data' => $topClients
            ];
            
            $response->getBody()->write(json_encode($data));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $error = [
                'success' => false,
                'message' => 'Failed to fetch top clients',
                'error' => $e->getMessage()
            ];
            
            $response->getBody()->write(json_encode($error));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }
}
