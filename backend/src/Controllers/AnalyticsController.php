<?php

namespace App\Controllers;

use App\Services\AnalyticsService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class AnalyticsController
{
    private AnalyticsService $analyticsService;

    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    public function getDashboardMetrics(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            $period = $queryParams['period'] ?? '30d';
            $startDate = $queryParams['start_date'] ?? null;
            $endDate = $queryParams['end_date'] ?? null;
            
            $metrics = $this->analyticsService->getDashboardMetrics($period, $startDate, $endDate);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $metrics
            ]));
            
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }

    public function getRevenueAnalytics(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            $period = $queryParams['period'] ?? '30d';
            $groupBy = $queryParams['group_by'] ?? 'day';
            $startDate = $queryParams['start_date'] ?? null;
            $endDate = $queryParams['end_date'] ?? null;
            
            $analytics = $this->analyticsService->getRevenueAnalytics($period, $groupBy, $startDate, $endDate);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $analytics
            ]));
            
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }

    public function getClientAnalytics(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            $period = $queryParams['period'] ?? '30d';
            $metric = $queryParams['metric'] ?? 'acquisition';
            
            $analytics = $this->analyticsService->getClientAnalytics($period, $metric);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $analytics
            ]));
            
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }

    public function getOrderAnalytics(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            $period = $queryParams['period'] ?? '30d';
            $groupBy = $queryParams['group_by'] ?? 'status';
            
            $analytics = $this->analyticsService->getOrderAnalytics($period, $groupBy);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $analytics
            ]));
            
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }

    public function getPerformanceMetrics(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            $period = $queryParams['period'] ?? '30d';
            $metric = $queryParams['metric'] ?? 'efficiency';
            
            $metrics = $this->analyticsService->getPerformanceMetrics($period, $metric);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $metrics
            ]));
            
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }

    public function getPredictiveAnalytics(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            $type = $queryParams['type'] ?? 'revenue_forecast';
            $period = $queryParams['period'] ?? '90d';
            
            $predictions = $this->analyticsService->getPredictiveAnalytics($type, $period);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $predictions
            ]));
            
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }

    public function getCustomReport(Request $request, Response $response): Response
    {
        try {
            $data = json_decode($request->getBody()->getContents(), true);
            
            // Validate required fields
            if (!isset($data['report_config'])) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'Report configuration is required'
                ]));
                
                return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
            }
            
            $report = $this->analyticsService->generateCustomReport($data['report_config']);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $report
            ]));
            
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }

    public function getCohortAnalysis(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            $metric = $queryParams['metric'] ?? 'retention';
            $period = $queryParams['period'] ?? 'monthly';
            $startDate = $queryParams['start_date'] ?? null;
            $endDate = $queryParams['end_date'] ?? null;
            
            $cohortData = $this->analyticsService->getCohortAnalysis($metric, $period, $startDate, $endDate);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $cohortData
            ]));
            
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }

    public function getFunnelAnalysis(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            $funnelType = $queryParams['funnel'] ?? 'sales';
            $period = $queryParams['period'] ?? '30d';
            
            $funnelData = $this->analyticsService->getFunnelAnalysis($funnelType, $period);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $funnelData
            ]));
            
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }

    public function getSegmentAnalysis(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            $segmentBy = $queryParams['segment_by'] ?? 'value';
            $metric = $queryParams['metric'] ?? 'revenue';
            $period = $queryParams['period'] ?? '30d';
            
            $segmentData = $this->analyticsService->getSegmentAnalysis($segmentBy, $metric, $period);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $segmentData
            ]));
            
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }

    public function exportReport(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            $reportType = $queryParams['type'] ?? 'dashboard';
            $format = $queryParams['format'] ?? 'csv';
            $period = $queryParams['period'] ?? '30d';
            
            $exportData = $this->analyticsService->exportReport($reportType, $format, $period);
            
            $response->getBody()->write($exportData['content']);
            
            return $response
                ->withHeader('Content-Type', $exportData['mime_type'])
                ->withHeader('Content-Disposition', 'attachment; filename="' . $exportData['filename'] . '"');
                
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }
}
