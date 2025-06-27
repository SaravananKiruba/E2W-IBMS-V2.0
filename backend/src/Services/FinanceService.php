<?php

namespace App\Services;

use App\Database\DatabaseManager;
use PDO;

class FinanceService
{
    public function getTransactions(string $tenant, array $params = []): array
    {
        $db = DatabaseManager::getConnection($tenant);
        
        $page = max(1, (int)($params['page'] ?? 1));
        $limit = min(100, max(10, (int)($params['limit'] ?? 50)));
        $offset = ($page - 1) * $limit;
        
        $whereClause = '1=1';
        $bindings = [];
        
        // Date range filter
        if (!empty($params['dateFrom'])) {
            $whereClause .= ' AND DATE(EntryDate) >= :dateFrom';
            $bindings[':dateFrom'] = $params['dateFrom'];
        }
        
        if (!empty($params['dateTo'])) {
            $whereClause .= ' AND DATE(EntryDate) <= :dateTo';
            $bindings[':dateTo'] = $params['dateTo'];
        }
        
        // Transaction type filter
        if (!empty($params['type'])) {
            if ($params['type'] === 'income') {
                $whereClause .= ' AND AmountExcludingGST > 0';
            } elseif ($params['type'] === 'expense') {
                $whereClause .= ' AND AmountExcludingGST < 0';
            }
        }
        
        // Search functionality
        if (!empty($params['search'])) {
            $whereClause .= ' AND (BillNumber LIKE :search OR OrderNumber LIKE :search)';
            $bindings[':search'] = '%' . $params['search'] . '%';
        }
        
        // Get total count
        $countSql = "SELECT COUNT(*) as total FROM bill_table WHERE {$whereClause}";
        $countStmt = $db->prepare($countSql);
        $countStmt->execute($bindings);
        $total = $countStmt->fetch()['total'];
        
        // Get paginated data
        $sql = "
            SELECT 
                ID,
                EntryDate,
                EntryUser,
                BillNumber,
                BillDate,
                AmountExcludingGST,
                GSTAmount,
                OrderNumber,
                ValidityStatus
            FROM bill_table 
            WHERE {$whereClause}
            ORDER BY EntryDate DESC, BillDate DESC
            LIMIT :limit OFFSET :offset
        ";
        
        $stmt = $db->prepare($sql);
        foreach ($bindings as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $transactions = $stmt->fetchAll();
        
        // Format the data
        $formattedTransactions = array_map(function ($transaction) {
            $totalAmount = (float)$transaction['AmountExcludingGST'] + (float)$transaction['GSTAmount'];
            return [
                'id' => $transaction['ID'],
                'entryDate' => $transaction['EntryDate'],
                'entryUser' => $transaction['EntryUser'],
                'billNumber' => $transaction['BillNumber'],
                'billDate' => $transaction['BillDate'],
                'type' => $totalAmount >= 0 ? 'income' : 'expense',
                'amount' => abs($totalAmount),
                'amountExcludingGST' => abs((float)$transaction['AmountExcludingGST']),
                'gstAmount' => abs((float)$transaction['GSTAmount']),
                'orderNumber' => $transaction['OrderNumber'],
                'status' => $transaction['ValidityStatus'] ? 'active' : 'inactive'
            ];
        }, $transactions);
        
        return [
            'data' => $formattedTransactions,
            'total' => $total
        ];
    }

    public function getLedger(string $tenant, array $params = []): array
    {
        $db = DatabaseManager::getConnection($tenant);
        
        // Get opening balance
        $openingBalance = $this->getOpeningBalance($tenant, $params['dateFrom'] ?? null);
        
        // Get transactions within date range
        $whereClause = '1=1';
        $bindings = [];
        
        if (!empty($params['dateFrom'])) {
            $whereClause .= ' AND DATE(BillDate) >= :dateFrom';
            $bindings[':dateFrom'] = $params['dateFrom'];
        }
        
        if (!empty($params['dateTo'])) {
            $whereClause .= ' AND DATE(BillDate) <= :dateTo';
            $bindings[':dateTo'] = $params['dateTo'];
        }
        
        $sql = "
            SELECT 
                BillDate as date,
                BillNumber as reference,
                CASE 
                    WHEN (AmountExcludingGST + GSTAmount) >= 0 THEN 'Credit'
                    ELSE 'Debit'
                END as type,
                ABS(AmountExcludingGST + GSTAmount) as amount,
                OrderNumber,
                EntryUser
            FROM bill_table 
            WHERE {$whereClause} AND ValidityStatus = 1
            ORDER BY BillDate ASC, ID ASC
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->execute($bindings);
        $transactions = $stmt->fetchAll();
        
        // Calculate running balance
        $runningBalance = $openingBalance;
        $ledgerEntries = [];
        
        foreach ($transactions as $transaction) {
            if ($transaction['type'] === 'Credit') {
                $runningBalance += (float)$transaction['amount'];
            } else {
                $runningBalance -= (float)$transaction['amount'];
            }
            
            $ledgerEntries[] = [
                'date' => $transaction['date'],
                'reference' => $transaction['reference'],
                'orderNumber' => $transaction['OrderNumber'],
                'type' => $transaction['type'],
                'amount' => (float)$transaction['amount'],
                'balance' => $runningBalance,
                'entryUser' => $transaction['EntryUser']
            ];
        }
        
        return [
            'openingBalance' => $openingBalance,
            'closingBalance' => $runningBalance,
            'entries' => $ledgerEntries
        ];
    }

    public function recordPayment(string $tenant, array $data): int
    {
        $db = DatabaseManager::getConnection($tenant);
        
        $sql = "
            INSERT INTO bill_table (
                EntryDate,
                EntryUser,
                BillNumber,
                BillDate,
                AmountExcludingGST,
                GSTAmount,
                OrderNumber,
                ValidityStatus
            ) VALUES (
                NOW(),
                :entryUser,
                :billNumber,
                :billDate,
                :amountExcludingGST,
                :gstAmount,
                :orderNumber,
                1
            )
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':entryUser' => $data['entryUser'] ?? 'System',
            ':billNumber' => $data['billNumber'] ?? $this->generateBillNumber($tenant),
            ':billDate' => $data['billDate'] ?? date('Y-m-d'),
            ':amountExcludingGST' => $data['amountExcludingGST'] ?? 0,
            ':gstAmount' => $data['gstAmount'] ?? 0,
            ':orderNumber' => $data['orderNumber'] ?? 0
        ]);
        
        return $db->lastInsertId();
    }

    public function getFinancialSummary(string $tenant, array $params = []): array
    {
        $db = DatabaseManager::getConnection($tenant);
        
        $dateFrom = $params['dateFrom'] ?? date('Y-m-01'); // First day of current month
        $dateTo = $params['dateTo'] ?? date('Y-m-d'); // Today
        
        // Get total income
        $incomeSql = "
            SELECT 
                COALESCE(SUM(AmountExcludingGST + GSTAmount), 0) as totalIncome,
                COALESCE(SUM(AmountExcludingGST), 0) as incomeExcludingGST,
                COALESCE(SUM(GSTAmount), 0) as incomeGST
            FROM bill_table 
            WHERE DATE(BillDate) BETWEEN :dateFrom AND :dateTo 
            AND (AmountExcludingGST + GSTAmount) > 0 
            AND ValidityStatus = 1
        ";
        
        $stmt = $db->prepare($incomeSql);
        $stmt->execute([':dateFrom' => $dateFrom, ':dateTo' => $dateTo]);
        $income = $stmt->fetch();
        
        // Get total expenses
        $expenseSql = "
            SELECT 
                COALESCE(ABS(SUM(AmountExcludingGST + GSTAmount)), 0) as totalExpense,
                COALESCE(ABS(SUM(AmountExcludingGST)), 0) as expenseExcludingGST,
                COALESCE(ABS(SUM(GSTAmount)), 0) as expenseGST
            FROM bill_table 
            WHERE DATE(BillDate) BETWEEN :dateFrom AND :dateTo 
            AND (AmountExcludingGST + GSTAmount) < 0 
            AND ValidityStatus = 1
        ";
        
        $stmt = $db->prepare($expenseSql);
        $stmt->execute([':dateFrom' => $dateFrom, ':dateTo' => $dateTo]);
        $expense = $stmt->fetch();
        
        // Get outstanding payments
        $outstandingSql = "
            SELECT 
                COALESCE(SUM(BalanceAmount), 0) as totalOutstanding
            FROM order_table 
            WHERE PaymentStatus IN ('unpaid', 'partial')
            AND DATE(EntryDate) BETWEEN :dateFrom AND :dateTo
        ";
        
        $stmt = $db->prepare($outstandingSql);
        $stmt->execute([':dateFrom' => $dateFrom, ':dateTo' => $dateTo]);
        $outstanding = $stmt->fetch();
        
        return [
            'period' => [
                'from' => $dateFrom,
                'to' => $dateTo
            ],
            'income' => [
                'total' => (float)$income['totalIncome'],
                'excludingGST' => (float)$income['incomeExcludingGST'],
                'gst' => (float)$income['incomeGST']
            ],
            'expense' => [
                'total' => (float)$expense['totalExpense'],
                'excludingGST' => (float)$expense['expenseExcludingGST'],
                'gst' => (float)$expense['expenseGST']
            ],
            'netProfit' => (float)$income['totalIncome'] - (float)$expense['totalExpense'],
            'outstanding' => (float)$outstanding['totalOutstanding']
        ];
    }

    public function getBalanceSheet(string $tenant, array $params = []): array
    {
        $db = DatabaseManager::getConnection($tenant);
        
        $asOfDate = $params['asOfDate'] ?? date('Y-m-d');
        
        // Get total assets (outstanding receivables + cash)
        $assetsSql = "
            SELECT 
                COALESCE(SUM(BalanceAmount), 0) as receivables,
                COALESCE((
                    SELECT SUM(AmountExcludingGST + GSTAmount) 
                    FROM bill_table 
                    WHERE DATE(BillDate) <= :asOfDate 
                    AND ValidityStatus = 1
                ), 0) as cashAndBank
            FROM order_table 
            WHERE PaymentStatus IN ('unpaid', 'partial')
            AND DATE(EntryDate) <= :asOfDate
        ";
        
        $stmt = $db->prepare($assetsSql);
        $stmt->execute([':asOfDate' => $asOfDate]);
        $assets = $stmt->fetch();
        
        // Calculate total assets
        $totalAssets = (float)$assets['receivables'] + (float)$assets['cashAndBank'];
        
        // For simplicity, we'll assume no liabilities in this basic implementation
        $totalLiabilities = 0;
        $netWorth = $totalAssets - $totalLiabilities;
        
        return [
            'asOfDate' => $asOfDate,
            'assets' => [
                'receivables' => (float)$assets['receivables'],
                'cashAndBank' => (float)$assets['cashAndBank'],
                'total' => $totalAssets
            ],
            'liabilities' => [
                'total' => $totalLiabilities
            ],
            'equity' => [
                'netWorth' => $netWorth,
                'total' => $netWorth
            ]
        ];
    }

    private function getOpeningBalance(string $tenant, ?string $dateFrom): float
    {
        if (!$dateFrom) {
            return 0.0;
        }
        
        $db = DatabaseManager::getConnection($tenant);
        
        $sql = "
            SELECT COALESCE(SUM(AmountExcludingGST + GSTAmount), 0) as balance
            FROM bill_table 
            WHERE DATE(BillDate) < :dateFrom 
            AND ValidityStatus = 1
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([':dateFrom' => $dateFrom]);
        $result = $stmt->fetch();
        
        return (float)$result['balance'];
    }

    private function generateBillNumber(string $tenant): string
    {
        $prefix = strtoupper(substr($tenant, 0, 3));
        $timestamp = date('YmdHis');
        $random = str_pad(mt_rand(1, 999), 3, '0', STR_PAD_LEFT);
        return "BILL-{$prefix}-{$timestamp}-{$random}";
    }
}
