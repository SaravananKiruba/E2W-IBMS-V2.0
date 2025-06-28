<?php

namespace App\Services;

use App\Database\DatabaseManager;
use PDO;

class AnalyticsService
{
    private string $tenant;

    public function __construct(string $tenant = 'easy2work')
    {
        $this->tenant = $tenant;
    }

    private function getConnection(): PDO
    {
        return DatabaseManager::getConnection($this->tenant);
    }

    private function query(string $sql, array $params = []): array
    {
        $pdo = $this->getConnection();
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    private function getDateRange(string $period, ?string $startDate = null, ?string $endDate = null): array
    {
        if ($startDate && $endDate) {
            return ['start' => $startDate, 'end' => $endDate];
        }
        
        $end = date('Y-m-d');
        $start = match($period) {
            '7d' => date('Y-m-d', strtotime('-7 days')),
            '30d' => date('Y-m-d', strtotime('-30 days')),
            '90d' => date('Y-m-d', strtotime('-90 days')),
            '1y' => date('Y-m-d', strtotime('-1 year')),
            'mtd' => date('Y-m-01'),
            'ytd' => date('Y-01-01'),
            default => date('Y-m-d', strtotime('-30 days'))
        };
        
        return ['start' => $start, 'end' => $end];
    }

    public function getDashboardMetrics(string $period = '30d', ?string $startDate = null, ?string $endDate = null): array
    {
        $dateRange = $this->getDateRange($period, $startDate, $endDate);
        
        $metrics = [];
        
        // Revenue metrics
        $revenueSQL = "SELECT 
                         SUM(total_amount) as total_revenue,
                         COUNT(*) as total_orders,
                         AVG(total_amount) as avg_order_value
                       FROM orders 
                       WHERE created_at BETWEEN :start_date AND :end_date";
        
        $revenueResult = $this->query($revenueSQL, [
            'start_date' => $dateRange['start'],
            'end_date' => $dateRange['end']
        ]);
        $metrics['revenue'] = $revenueResult[0] ?? [];
        
        // Client metrics
        $clientSQL = "SELECT 
                        COUNT(*) as total_clients,
                        COUNT(CASE WHEN created_at BETWEEN :start_date AND :end_date THEN 1 END) as new_clients,
                        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_clients
                      FROM clients";
        
        $clientResult = $this->query($clientSQL, [
            'start_date' => $dateRange['start'],
            'end_date' => $dateRange['end']
        ]);
        $metrics['clients'] = $clientResult[0] ?? [];
        
        // Order status distribution
        $orderStatusSQL = "SELECT status, COUNT(*) as count 
                          FROM orders 
                          WHERE created_at BETWEEN :start_date AND :end_date
                          GROUP BY status";
        
        $orderStatusResult = $this->query($orderStatusSQL, [
            'start_date' => $dateRange['start'],
            'end_date' => $dateRange['end']
        ]);
        $metrics['order_status'] = $orderStatusResult;
        
        // Growth rates (compare with previous period)
        $periodDays = (strtotime($dateRange['end']) - strtotime($dateRange['start'])) / 86400;
        $prevStart = date('Y-m-d', strtotime($dateRange['start'] . " -{$periodDays} days"));
        $prevEnd = date('Y-m-d', strtotime($dateRange['end'] . " -{$periodDays} days"));
        
        $prevRevenueSQL = "SELECT SUM(total_amount) as prev_revenue FROM orders 
                          WHERE created_at BETWEEN :prev_start AND :prev_end";
        $prevRevenueResult = $this->query($prevRevenueSQL, [
            'prev_start' => $prevStart,
            'prev_end' => $prevEnd
        ]);
        
        $currentRevenue = $metrics['revenue']['total_revenue'] ?? 0;
        $previousRevenue = $prevRevenueResult[0]['prev_revenue'] ?? 0;
        $metrics['growth'] = [
            'revenue_growth' => $previousRevenue > 0 ? (($currentRevenue - $previousRevenue) / $previousRevenue) * 100 : 0
        ];
        
        return $metrics;
    }

    public function getRevenueAnalytics(string $period = '30d', string $groupBy = 'day', ?string $startDate = null, ?string $endDate = null): array
    {
        $dateRange = $this->getDateRange($period, $startDate, $endDate);
        
        $groupByClause = match($groupBy) {
            'hour' => 'DATE_FORMAT(created_at, "%Y-%m-%d %H:00:00")',
            'day' => 'DATE(created_at)',
            'week' => 'YEARWEEK(created_at)',
            'month' => 'DATE_FORMAT(created_at, "%Y-%m")',
            'quarter' => 'CONCAT(YEAR(created_at), "-Q", QUARTER(created_at))',
            'year' => 'YEAR(created_at)',
            default => 'DATE(created_at)'
        };
        
        // Revenue over time
        $revenueTimeSQL = "SELECT 
                             {$groupByClause} as period,
                             SUM(total_amount) as revenue,
                             COUNT(*) as orders,
                             AVG(total_amount) as avg_order_value
                           FROM orders 
                           WHERE created_at BETWEEN :start_date AND :end_date
                           GROUP BY {$groupByClause}
                           ORDER BY period";
        
        $revenueTimeData = $this->query($revenueTimeSQL, [
            'start_date' => $dateRange['start'],
            'end_date' => $dateRange['end']
        ]);
        
        // Revenue by service type
        $revenueByServiceSQL = "SELECT 
                                  o.service_type,
                                  SUM(o.total_amount) as revenue,
                                  COUNT(*) as orders,
                                  AVG(o.total_amount) as avg_value
                                FROM orders o
                                WHERE o.created_at BETWEEN :start_date AND :end_date
                                GROUP BY o.service_type
                                ORDER BY revenue DESC";
        
        $revenueByService = $this->query($revenueByServiceSQL, [
            'start_date' => $dateRange['start'],
            'end_date' => $dateRange['end']
        ]);
        
        // Top performing clients by revenue
        $topClientsSQL = "SELECT 
                            c.name,
                            c.id,
                            SUM(o.total_amount) as total_revenue,
                            COUNT(o.id) as total_orders
                          FROM orders o
                          JOIN clients c ON o.client_id = c.id
                          WHERE o.created_at BETWEEN :start_date AND :end_date
                          GROUP BY c.id, c.name
                          ORDER BY total_revenue DESC
                          LIMIT 10";
        
        $topClients = $this->query($topClientsSQL, [
            'start_date' => $dateRange['start'],
            'end_date' => $dateRange['end']
        ]);
        
        return [
            'time_series' => $revenueTimeData,
            'by_service' => $revenueByService,
            'top_clients' => $topClients,
            'summary' => [
                'total_revenue' => array_sum(array_column($revenueTimeData, 'revenue')),
                'total_orders' => array_sum(array_column($revenueTimeData, 'orders')),
                'avg_daily_revenue' => count($revenueTimeData) > 0 ? array_sum(array_column($revenueTimeData, 'revenue')) / count($revenueTimeData) : 0
            ]
        ];
    }

    public function getClientAnalytics(string $period = '30d', string $metric = 'acquisition'): array
    {
        $dateRange = $this->getDateRange($period);
        
        switch ($metric) {
            case 'acquisition':
                return $this->getClientAcquisitionData($dateRange);
            case 'retention':
                return $this->getClientRetentionData($dateRange);
            case 'lifetime_value':
                return $this->getClientLifetimeValueData($dateRange);
            case 'segmentation':
                return $this->getClientSegmentationData($dateRange);
            default:
                return $this->getClientAcquisitionData($dateRange);
        }
    }

    public function getOrderAnalytics(string $period = '30d', string $groupBy = 'status'): array
    {
        $dateRange = $this->getDateRange($period);
        
        // Order distribution
        $orderDistSQL = "SELECT 
                           {$groupBy},
                           COUNT(*) as count,
                           SUM(total_amount) as revenue
                         FROM orders 
                         WHERE created_at BETWEEN :start_date AND :end_date
                         GROUP BY {$groupBy}
                         ORDER BY count DESC";
        
        $orderDistribution = $this->query($orderDistSQL, [
            'start_date' => $dateRange['start'],
            'end_date' => $dateRange['end']
        ]);
        
        // Order completion rates
        $completionSQL = "SELECT 
                            COUNT(*) as total_orders,
                            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
                            COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
                            AVG(DATEDIFF(completed_at, created_at)) as avg_completion_days
                          FROM orders 
                          WHERE created_at BETWEEN :start_date AND :end_date";
        
        $completionStats = $this->query($completionSQL, [
            'start_date' => $dateRange['start'],
            'end_date' => $dateRange['end']
        ]);
        
        // Order trends over time
        $trendsSQL = "SELECT 
                        DATE(created_at) as date,
                        COUNT(*) as orders,
                        SUM(total_amount) as revenue,
                        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
                      FROM orders 
                      WHERE created_at BETWEEN :start_date AND :end_date
                      GROUP BY DATE(created_at)
                      ORDER BY date";
        
        $trends = $this->query($trendsSQL, [
            'start_date' => $dateRange['start'],
            'end_date' => $dateRange['end']
        ]);
        
        return [
            'distribution' => $orderDistribution,
            'completion_stats' => $completionStats[0] ?? [],
            'trends' => $trends
        ];
    }

    public function getPerformanceMetrics(string $period = '30d', string $metric = 'efficiency'): array
    {
        $dateRange = $this->getDateRange($period);
        
        switch ($metric) {
            case 'efficiency':
                return $this->getEfficiencyMetrics($dateRange);
            case 'productivity':
                return $this->getProductivityMetrics($dateRange);
            case 'quality':
                return $this->getQualityMetrics($dateRange);
            default:
                return $this->getEfficiencyMetrics($dateRange);
        }
    }

    public function getPredictiveAnalytics(string $type = 'revenue_forecast', string $period = '90d'): array
    {
        switch ($type) {
            case 'revenue_forecast':
                return $this->getRevenueForecast($period);
            case 'client_churn':
                return $this->getChurnPrediction($period);
            case 'demand_forecast':
                return $this->getDemandForecast($period);
            default:
                return $this->getRevenueForecast($period);
        }
    }

    public function generateCustomReport(array $config): array
    {
        $reportData = [];
        
        // Process each metric in the configuration
        foreach ($config['metrics'] as $metric) {
            switch ($metric['type']) {
                case 'revenue':
                    $reportData[$metric['name']] = $this->getRevenueAnalytics(
                        $config['period'] ?? '30d',
                        $metric['group_by'] ?? 'day'
                    );
                    break;
                case 'clients':
                    $reportData[$metric['name']] = $this->getClientAnalytics(
                        $config['period'] ?? '30d',
                        $metric['metric'] ?? 'acquisition'
                    );
                    break;
                case 'orders':
                    $reportData[$metric['name']] = $this->getOrderAnalytics(
                        $config['period'] ?? '30d',
                        $metric['group_by'] ?? 'status'
                    );
                    break;
                // Add more metric types as needed
            }
        }
        
        return [
            'report_id' => uniqid('report_'),
            'generated_at' => date('Y-m-d H:i:s'),
            'config' => $config,
            'data' => $reportData
        ];
    }

    public function getCohortAnalysis(string $metric = 'retention', string $period = 'monthly', ?string $startDate = null, ?string $endDate = null): array
    {
        $dateRange = $this->getDateRange('1y', $startDate, $endDate); // Default to 1 year for cohort analysis
        
        // Implementation would depend on the specific cohort analysis requirements
        // This is a simplified version
        
        $cohortSQL = "SELECT 
                        DATE_FORMAT(first_order.created_at, '%Y-%m') as cohort_month,
                        COUNT(DISTINCT first_order.client_id) as cohort_size,
                        COUNT(DISTINCT repeat_order.client_id) as retained_clients
                      FROM (
                        SELECT client_id, MIN(created_at) as created_at
                        FROM orders
                        WHERE created_at BETWEEN :start_date AND :end_date
                        GROUP BY client_id
                      ) first_order
                      LEFT JOIN orders repeat_order ON first_order.client_id = repeat_order.client_id 
                        AND repeat_order.created_at > first_order.created_at
                        AND repeat_order.created_at <= DATE_ADD(first_order.created_at, INTERVAL 1 MONTH)
                      GROUP BY cohort_month
                      ORDER BY cohort_month";
        
        $cohortData = $this->query($cohortSQL, [
            'start_date' => $dateRange['start'],
            'end_date' => $dateRange['end']
        ]);
        
        return [
            'cohorts' => $cohortData,
            'metric' => $metric,
            'period' => $period
        ];
    }

    public function getFunnelAnalysis(string $funnelType = 'sales', string $period = '30d'): array
    {
        $dateRange = $this->getDateRange($period);
        
        switch ($funnelType) {
            case 'sales':
                return $this->getSalesFunnelData($dateRange);
            case 'onboarding':
                return $this->getOnboardingFunnelData($dateRange);
            default:
                return $this->getSalesFunnelData($dateRange);
        }
    }

    public function getSegmentAnalysis(string $segmentBy = 'value', string $metric = 'revenue', string $period = '30d'): array
    {
        $dateRange = $this->getDateRange($period);
        
        // Client segmentation by value
        $segmentSQL = "SELECT 
                         CASE 
                           WHEN total_value >= 10000 THEN 'High Value'
                           WHEN total_value >= 5000 THEN 'Medium Value'
                           WHEN total_value >= 1000 THEN 'Low Value'
                           ELSE 'Minimal Value'
                         END as segment,
                         COUNT(*) as client_count,
                         SUM(total_value) as total_revenue,
                         AVG(total_value) as avg_revenue
                       FROM (
                         SELECT 
                           c.id,
                           c.name,
                           COALESCE(SUM(o.total_amount), 0) as total_value
                         FROM clients c
                         LEFT JOIN orders o ON c.id = o.client_id
                         GROUP BY c.id, c.name
                       ) client_values
                       GROUP BY segment
                       ORDER BY total_revenue DESC";
        
        $segmentData = $this->query($segmentSQL);
        
        return [
            'segments' => $segmentData,
            'segment_by' => $segmentBy,
            'metric' => $metric
        ];
    }

    public function exportReport(string $reportType, string $format, string $period): array
    {
        // Get the data based on report type
        $data = match($reportType) {
            'dashboard' => $this->getDashboardMetrics($period),
            'revenue' => $this->getRevenueAnalytics($period),
            'clients' => $this->getClientAnalytics($period),
            'orders' => $this->getOrderAnalytics($period),
            default => $this->getDashboardMetrics($period)
        };
        
        // Format the data based on requested format
        switch ($format) {
            case 'csv':
                return $this->exportToCSV($data, $reportType);
            case 'excel':
                return $this->exportToExcel($data, $reportType);
            case 'pdf':
                return $this->exportToPDF($data, $reportType);
            default:
                return $this->exportToCSV($data, $reportType);
        }
    }

    // Private helper methods

    private function getClientAcquisitionData(array $dateRange): array
    {
        $acquisitionSQL = "SELECT 
                             DATE(created_at) as date,
                             COUNT(*) as new_clients
                           FROM clients 
                           WHERE created_at BETWEEN :start_date AND :end_date
                           GROUP BY DATE(created_at)
                           ORDER BY date";
        
        return $this->query($acquisitionSQL, [
            'start_date' => $dateRange['start'],
            'end_date' => $dateRange['end']
        ]);
    }

    private function getClientRetentionData(array $dateRange): array
    {
        // Simplified retention calculation
        $retentionSQL = "SELECT 
                           COUNT(DISTINCT client_id) as total_clients,
                           COUNT(DISTINCT CASE WHEN order_count > 1 THEN client_id END) as retained_clients
                         FROM (
                           SELECT client_id, COUNT(*) as order_count
                           FROM orders
                           WHERE created_at BETWEEN :start_date AND :end_date
                           GROUP BY client_id
                         ) client_orders";
        
        $result = $this->query($retentionSQL, [
            'start_date' => $dateRange['start'],
            'end_date' => $dateRange['end']
        ]);
        
        return $result[0] ?? [];
    }

    private function getClientLifetimeValueData(array $dateRange): array
    {
        $clvSQL = "SELECT 
                     c.id,
                     c.name,
                     COUNT(o.id) as total_orders,
                     SUM(o.total_amount) as lifetime_value,
                     AVG(o.total_amount) as avg_order_value,
                     DATEDIFF(MAX(o.created_at), MIN(o.created_at)) as customer_lifespan_days
                   FROM clients c
                   LEFT JOIN orders o ON c.id = o.client_id
                   WHERE c.created_at <= :end_date
                   GROUP BY c.id, c.name
                   HAVING total_orders > 0
                   ORDER BY lifetime_value DESC
                   LIMIT 100";
        
        return $this->query($clvSQL, ['end_date' => $dateRange['end']]);
    }

    private function getClientSegmentationData(array $dateRange): array
    {
        // Implementation for client segmentation
        return [];
    }

    private function getEfficiencyMetrics(array $dateRange): array
    {
        // Implementation for efficiency metrics
        return [];
    }

    private function getProductivityMetrics(array $dateRange): array
    {
        // Implementation for productivity metrics
        return [];
    }

    private function getQualityMetrics(array $dateRange): array
    {
        // Implementation for quality metrics
        return [];
    }

    private function getRevenueForecast(string $period): array
    {
        // Simple linear regression forecast based on historical data
        // In a real implementation, you'd use more sophisticated forecasting algorithms
        
        $historicalSQL = "SELECT 
                            DATE(created_at) as date,
                            SUM(total_amount) as revenue
                          FROM orders 
                          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
                          GROUP BY DATE(created_at)
                          ORDER BY date";
        
        $historicalData = $this->query($historicalSQL);
        
        // Simple forecast (this would be more sophisticated in reality)
        $avgDailyRevenue = array_sum(array_column($historicalData, 'revenue')) / count($historicalData);
        $forecast = [];
        
        for ($i = 1; $i <= 30; $i++) {
            $forecast[] = [
                'date' => date('Y-m-d', strtotime("+{$i} days")),
                'predicted_revenue' => $avgDailyRevenue * (1 + (rand(-10, 10) / 100)) // Add some variance
            ];
        }
        
        return [
            'historical' => $historicalData,
            'forecast' => $forecast,
            'confidence_interval' => 0.8
        ];
    }

    private function getChurnPrediction(string $period): array
    {
        // Implementation for churn prediction
        return [];
    }

    private function getDemandForecast(string $period): array
    {
        // Implementation for demand forecasting
        return [];
    }

    private function getSalesFunnelData(array $dateRange): array
    {
        // Implementation for sales funnel analysis
        return [];
    }

    private function getOnboardingFunnelData(array $dateRange): array
    {
        // Implementation for onboarding funnel analysis
        return [];
    }

    private function exportToCSV(array $data, string $reportType): array
    {
        $csv = '';
        $filename = "{$reportType}_report_" . date('Y-m-d') . '.csv';
        
        // Convert data to CSV format (simplified)
        if (!empty($data)) {
            $headers = array_keys($data);
            $csv .= implode(',', $headers) . "\n";
            
            // Add data rows (this would need to be more sophisticated for complex data structures)
            foreach ($data as $key => $value) {
                if (is_array($value)) {
                    $csv .= $key . ',' . json_encode($value) . "\n";
                } else {
                    $csv .= $key . ',' . $value . "\n";
                }
            }
        }
        
        return [
            'content' => $csv,
            'filename' => $filename,
            'mime_type' => 'text/csv'
        ];
    }

    private function exportToExcel(array $data, string $reportType): array
    {
        // Implementation for Excel export (would use PhpSpreadsheet)
        return $this->exportToCSV($data, $reportType); // Fallback to CSV for now
    }

    private function exportToPDF(array $data, string $reportType): array
    {
        // Implementation for PDF export (would use TCPDF or similar)
        return $this->exportToCSV($data, $reportType); // Fallback to CSV for now
    }
}
