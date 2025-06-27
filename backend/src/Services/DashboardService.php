<?php

namespace App\Services;

use App\Database\DatabaseManager;
use PDO;

class DashboardService
{
    public function getStats(string $tenant, array $params = []): array
    {
        $db = DatabaseManager::getConnection($tenant);
        
        $dateFrom = $params['dateFrom'] ?? date('Y-m-01'); // First day of current month
        $dateTo = $params['dateTo'] ?? date('Y-m-d'); // Today
        
        // Get total clients
        $clientsSql = "SELECT COUNT(*) as total FROM client_table WHERE Validity = 1";
        $clientsStmt = $db->prepare($clientsSql);
        $clientsStmt->execute();
        $totalClients = $clientsStmt->fetch()['total'];
        
        // Get new clients this month
        $newClientsSql = "
            SELECT COUNT(*) as total 
            FROM client_table 
            WHERE Validity = 1 
            AND DATE(EntryDateTime) BETWEEN :dateFrom AND :dateTo
        ";
        $newClientsStmt = $db->prepare($newClientsSql);
        $newClientsStmt->execute([':dateFrom' => $dateFrom, ':dateTo' => $dateTo]);
        $newClients = $newClientsStmt->fetch()['total'];
        
        // Get total orders
        $ordersSql = "SELECT COUNT(*) as total FROM order_table";
        $ordersStmt = $db->prepare($ordersSql);
        $ordersStmt->execute();
        $totalOrders = $ordersStmt->fetch()['total'];
        
        // Get new orders this month
        $newOrdersSql = "
            SELECT COUNT(*) as total 
            FROM order_table 
            WHERE DATE(EntryDate) BETWEEN :dateFrom AND :dateTo
        ";
        $newOrdersStmt = $db->prepare($newOrdersSql);
        $newOrdersStmt->execute([':dateFrom' => $dateFrom, ':dateTo' => $dateTo]);
        $newOrders = $newOrdersStmt->fetch()['total'];
        
        // Get revenue this month
        $revenueSql = "
            SELECT 
                COALESCE(SUM(NetAmount), 0) as totalRevenue,
                COALESCE(SUM(PaidAmount), 0) as paidRevenue,
                COALESCE(SUM(BalanceAmount), 0) as pendingRevenue
            FROM order_table 
            WHERE DATE(EntryDate) BETWEEN :dateFrom AND :dateTo
        ";
        $revenueStmt = $db->prepare($revenueSql);
        $revenueStmt->execute([':dateFrom' => $dateFrom, ':dateTo' => $dateTo]);
        $revenue = $revenueStmt->fetch();
        
        // Get pending orders
        $pendingOrdersSql = "
            SELECT COUNT(*) as total 
            FROM order_table 
            WHERE Status IN ('pending', 'processing')
        ";
        $pendingOrdersStmt = $db->prepare($pendingOrdersSql);
        $pendingOrdersStmt->execute();
        $pendingOrders = $pendingOrdersStmt->fetch()['total'];
        
        // Get overdue orders (delivery date passed)
        $overdueOrdersSql = "
            SELECT COUNT(*) as total 
            FROM order_table 
            WHERE Status NOT IN ('completed', 'cancelled')
            AND DeliveryDate < CURDATE()
            AND DeliveryDate IS NOT NULL
        ";
        $overdueOrdersStmt = $db->prepare($overdueOrdersSql);
        $overdueOrdersStmt->execute();
        $overdueOrders = $overdueOrdersStmt->fetch()['total'];
        
        return [
            'period' => [
                'from' => $dateFrom,
                'to' => $dateTo
            ],
            'clients' => [
                'total' => (int)$totalClients,
                'new' => (int)$newClients,
                'growth' => $this->calculateGrowthRate($tenant, 'clients', $dateFrom, $dateTo)
            ],
            'orders' => [
                'total' => (int)$totalOrders,
                'new' => (int)$newOrders,
                'pending' => (int)$pendingOrders,
                'overdue' => (int)$overdueOrders,
                'growth' => $this->calculateGrowthRate($tenant, 'orders', $dateFrom, $dateTo)
            ],
            'revenue' => [
                'total' => (float)$revenue['totalRevenue'],
                'paid' => (float)$revenue['paidRevenue'],
                'pending' => (float)$revenue['pendingRevenue'],
                'growth' => $this->calculateGrowthRate($tenant, 'revenue', $dateFrom, $dateTo)
            ]
        ];
    }

    public function getRecentActivity(string $tenant, array $params = []): array
    {
        $db = DatabaseManager::getConnection($tenant);
        
        $limit = min(50, max(5, (int)($params['limit'] ?? 20)));
        
        $activities = [];
        
        // Recent orders
        $ordersSql = "
            SELECT 
                'order' as type,
                o.OrderNumber as reference,
                c.ClientName as clientName,
                o.EntryDate as date,
                o.EntryUser as user,
                o.Status as status,
                o.NetAmount as amount
            FROM order_table o
            LEFT JOIN client_table c ON o.ClientID = c.ID
            ORDER BY o.EntryDate DESC
            LIMIT :limit
        ";
        
        $ordersStmt = $db->prepare($ordersSql);
        $ordersStmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $ordersStmt->execute();
        $orders = $ordersStmt->fetchAll();
        
        foreach ($orders as $order) {
            $activities[] = [
                'type' => 'order',
                'id' => $order['reference'],
                'title' => "New order #{$order['reference']}",
                'description' => "Order for {$order['clientName']} - ₹" . number_format($order['amount'], 2),
                'date' => $order['date'],
                'user' => $order['user'],
                'status' => $order['status'],
                'amount' => (float)$order['amount']
            ];
        }
        
        // Recent clients
        $clientsSql = "
            SELECT 
                'client' as type,
                ID,
                ClientName,
                EntryDateTime as date,
                EntryUser as user,
                'active' as status
            FROM client_table
            WHERE Validity = 1
            ORDER BY EntryDateTime DESC
            LIMIT :limit
        ";
        
        $clientsStmt = $db->prepare($clientsSql);
        $clientsStmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $clientsStmt->execute();
        $clients = $clientsStmt->fetchAll();
        
        foreach ($clients as $client) {
            $activities[] = [
                'type' => 'client',
                'id' => $client['ID'],
                'title' => "New client registered",
                'description' => "Client: {$client['ClientName']}",
                'date' => $client['date'],
                'user' => $client['user'],
                'status' => $client['status'],
                'amount' => null
            ];
        }
        
        // Recent payments
        $paymentsSql = "
            SELECT 
                'payment' as type,
                BillNumber as reference,
                BillDate as date,
                EntryUser as user,
                (AmountExcludingGST + GSTAmount) as amount,
                'completed' as status
            FROM bill_table
            WHERE ValidityStatus = 1
            AND (AmountExcludingGST + GSTAmount) > 0
            ORDER BY EntryDate DESC
            LIMIT :limit
        ";
        
        $paymentsStmt = $db->prepare($paymentsSql);
        $paymentsStmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $paymentsStmt->execute();
        $payments = $paymentsStmt->fetchAll();
        
        foreach ($payments as $payment) {
            $activities[] = [
                'type' => 'payment',
                'id' => $payment['reference'],
                'title' => "Payment received",
                'description' => "Bill #{$payment['reference']} - ₹" . number_format($payment['amount'], 2),
                'date' => $payment['date'],
                'user' => $payment['user'],
                'status' => $payment['status'],
                'amount' => (float)$payment['amount']
            ];
        }
        
        // Sort by date descending and limit
        usort($activities, function($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });
        
        return array_slice($activities, 0, $limit);
    }

    public function getRevenueChart(string $tenant, array $params = []): array
    {
        $db = DatabaseManager::getConnection($tenant);
        
        $period = $params['period'] ?? 'month'; // month, quarter, year
        $year = $params['year'] ?? date('Y');
        
        $chartData = [];
        
        if ($period === 'month') {
            // Monthly data for the year
            for ($month = 1; $month <= 12; $month++) {
                $monthStart = "{$year}-{$month}-01";
                $monthEnd = date('Y-m-t', strtotime($monthStart));
                
                $sql = "
                    SELECT 
                        COALESCE(SUM(NetAmount), 0) as revenue,
                        COALESCE(SUM(PaidAmount), 0) as paid,
                        COUNT(*) as orders
                    FROM order_table 
                    WHERE DATE(EntryDate) BETWEEN :start AND :end
                ";
                
                $stmt = $db->prepare($sql);
                $stmt->execute([':start' => $monthStart, ':end' => $monthEnd]);
                $data = $stmt->fetch();
                
                $chartData[] = [
                    'period' => date('M Y', strtotime($monthStart)),
                    'month' => (int)$month,
                    'year' => (int)$year,
                    'revenue' => (float)$data['revenue'],
                    'paid' => (float)$data['paid'],
                    'pending' => (float)$data['revenue'] - (float)$data['paid'],
                    'orders' => (int)$data['orders']
                ];
            }
        } elseif ($period === 'quarter') {
            // Quarterly data
            $quarters = [
                ['Q1', 1, 3],
                ['Q2', 4, 6],
                ['Q3', 7, 9],
                ['Q4', 10, 12]
            ];
            
            foreach ($quarters as [$quarter, $startMonth, $endMonth]) {
                $quarterStart = "{$year}-{$startMonth}-01";
                $quarterEnd = date('Y-m-t', strtotime("{$year}-{$endMonth}-01"));
                
                $sql = "
                    SELECT 
                        COALESCE(SUM(NetAmount), 0) as revenue,
                        COALESCE(SUM(PaidAmount), 0) as paid,
                        COUNT(*) as orders
                    FROM order_table 
                    WHERE DATE(EntryDate) BETWEEN :start AND :end
                ";
                
                $stmt = $db->prepare($sql);
                $stmt->execute([':start' => $quarterStart, ':end' => $quarterEnd]);
                $data = $stmt->fetch();
                
                $chartData[] = [
                    'period' => "{$quarter} {$year}",
                    'quarter' => $quarter,
                    'year' => (int)$year,
                    'revenue' => (float)$data['revenue'],
                    'paid' => (float)$data['paid'],
                    'pending' => (float)$data['revenue'] - (float)$data['paid'],
                    'orders' => (int)$data['orders']
                ];
            }
        }
        
        return $chartData;
    }

    public function getTopClients(string $tenant, array $params = []): array
    {
        $db = DatabaseManager::getConnection($tenant);
        
        $limit = min(20, max(5, (int)($params['limit'] ?? 10)));
        $dateFrom = $params['dateFrom'] ?? date('Y-01-01'); // Start of year
        $dateTo = $params['dateTo'] ?? date('Y-m-d'); // Today
        
        $sql = "
            SELECT 
                c.ID,
                c.ClientName,
                c.ClientContact,
                c.ClientEmail,
                COUNT(o.OrderNumber) as totalOrders,
                COALESCE(SUM(o.NetAmount), 0) as totalRevenue,
                COALESCE(SUM(o.PaidAmount), 0) as paidAmount,
                COALESCE(SUM(o.BalanceAmount), 0) as pendingAmount,
                MAX(o.EntryDate) as lastOrderDate
            FROM client_table c
            LEFT JOIN order_table o ON c.ID = o.ClientID
            WHERE c.Validity = 1
            AND (o.EntryDate IS NULL OR DATE(o.EntryDate) BETWEEN :dateFrom AND :dateTo)
            GROUP BY c.ID, c.ClientName, c.ClientContact, c.ClientEmail
            HAVING totalRevenue > 0
            ORDER BY totalRevenue DESC
            LIMIT :limit
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->bindValue(':dateFrom', $dateFrom);
        $stmt->bindValue(':dateTo', $dateTo);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        
        $clients = $stmt->fetchAll();
        
        return array_map(function($client) {
            return [
                'id' => $client['ID'],
                'name' => $client['ClientName'],
                'contact' => $client['ClientContact'],
                'email' => $client['ClientEmail'],
                'totalOrders' => (int)$client['totalOrders'],
                'totalRevenue' => (float)$client['totalRevenue'],
                'paidAmount' => (float)$client['paidAmount'],
                'pendingAmount' => (float)$client['pendingAmount'],
                'lastOrderDate' => $client['lastOrderDate']
            ];
        }, $clients);
    }

    private function calculateGrowthRate(string $tenant, string $metric, string $dateFrom, string $dateTo): float
    {
        $db = DatabaseManager::getConnection($tenant);
        
        // Calculate previous period
        $currentStart = new \DateTime($dateFrom);
        $currentEnd = new \DateTime($dateTo);
        $diff = $currentStart->diff($currentEnd);
        
        $previousStart = clone $currentStart;
        $previousEnd = clone $currentEnd;
        $previousStart->sub($diff);
        $previousEnd->sub($diff);
        
        $currentValue = 0;
        $previousValue = 0;
        
        switch ($metric) {
            case 'clients':
                $sql = "SELECT COUNT(*) as total FROM client_table WHERE Validity = 1 AND DATE(EntryDateTime) BETWEEN :start AND :end";
                break;
            case 'orders':
                $sql = "SELECT COUNT(*) as total FROM order_table WHERE DATE(EntryDate) BETWEEN :start AND :end";
                break;
            case 'revenue':
                $sql = "SELECT COALESCE(SUM(NetAmount), 0) as total FROM order_table WHERE DATE(EntryDate) BETWEEN :start AND :end";
                break;
            default:
                return 0.0;
        }
        
        // Get current period value
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':start' => $currentStart->format('Y-m-d'),
            ':end' => $currentEnd->format('Y-m-d')
        ]);
        $currentValue = $stmt->fetch()['total'];
        
        // Get previous period value
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':start' => $previousStart->format('Y-m-d'),
            ':end' => $previousEnd->format('Y-m-d')
        ]);
        $previousValue = $stmt->fetch()['total'];
        
        if ($previousValue == 0) {
            return $currentValue > 0 ? 100.0 : 0.0;
        }
        
        return round((($currentValue - $previousValue) / $previousValue) * 100, 2);
    }
}
