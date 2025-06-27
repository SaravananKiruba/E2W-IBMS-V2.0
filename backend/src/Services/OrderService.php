<?php

namespace App\Services;

use App\Database\DatabaseManager;
use PDO;

class OrderService
{
    public function getOrders(string $tenant, array $params = []): array
    {
        $db = DatabaseManager::getConnection($tenant);
        
        $page = max(1, (int)($params['page'] ?? 1));
        $limit = min(100, max(10, (int)($params['limit'] ?? 50)));
        $offset = ($page - 1) * $limit;
        
        $whereClause = '1=1';
        $bindings = [];
        
        // Search functionality
        if (!empty($params['search'])) {
            $whereClause .= ' AND (o.OrderNumber LIKE :search OR c.ClientName LIKE :search)';
            $bindings[':search'] = '%' . $params['search'] . '%';
        }
        
        // Status filter
        if (!empty($params['status'])) {
            $whereClause .= ' AND o.Status = :status';
            $bindings[':status'] = $params['status'];
        }
        
        // Date range filter
        if (!empty($params['dateFrom'])) {
            $whereClause .= ' AND DATE(o.EntryDate) >= :dateFrom';
            $bindings[':dateFrom'] = $params['dateFrom'];
        }
        
        if (!empty($params['dateTo'])) {
            $whereClause .= ' AND DATE(o.EntryDate) <= :dateTo';
            $bindings[':dateTo'] = $params['dateTo'];
        }
        
        // Get total count
        $countSql = "
            SELECT COUNT(*) as total 
            FROM order_table o
            LEFT JOIN client_table c ON o.ClientID = c.ID
            WHERE {$whereClause}
        ";
        $countStmt = $db->prepare($countSql);
        $countStmt->execute($bindings);
        $total = $countStmt->fetch()['total'];
        
        // Get paginated data
        $sql = "
            SELECT 
                o.OrderNumber,
                o.EntryDate,
                o.EntryUser,
                o.ClientID,
                c.ClientName,
                c.ClientContact,
                c.ClientEmail,
                o.Status,
                o.TotalAmount,
                o.GSTAmount,
                o.NetAmount,
                o.PaidAmount,
                o.BalanceAmount,
                o.Discount,
                o.PaymentStatus,
                o.OrderType,
                o.DeliveryDate,
                o.Remarks
            FROM order_table o
            LEFT JOIN client_table c ON o.ClientID = c.ID
            WHERE {$whereClause}
            ORDER BY o.EntryDate DESC
            LIMIT :limit OFFSET :offset
        ";
        
        $stmt = $db->prepare($sql);
        foreach ($bindings as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $orders = $stmt->fetchAll();
        
        // Format the data
        $formattedOrders = array_map(function ($order) {
            return [
                'orderNumber' => $order['OrderNumber'],
                'entryDate' => $order['EntryDate'],
                'entryUser' => $order['EntryUser'],
                'clientId' => $order['ClientID'],
                'clientName' => $order['ClientName'],
                'clientContact' => $order['ClientContact'],
                'clientEmail' => $order['ClientEmail'],
                'status' => $order['Status'],
                'totalAmount' => (float)$order['TotalAmount'],
                'gstAmount' => (float)$order['GSTAmount'],
                'netAmount' => (float)$order['NetAmount'],
                'paidAmount' => (float)$order['PaidAmount'],
                'balanceAmount' => (float)$order['BalanceAmount'],
                'discount' => (float)$order['Discount'],
                'paymentStatus' => $order['PaymentStatus'],
                'orderType' => $order['OrderType'],
                'deliveryDate' => $order['DeliveryDate'],
                'remarks' => $order['Remarks']
            ];
        }, $orders);
        
        return [
            'data' => $formattedOrders,
            'total' => $total
        ];
    }

    public function getOrder(string $tenant, string $orderNumber): ?array
    {
        $db = DatabaseManager::getConnection($tenant);
        
        $sql = "
            SELECT 
                o.*,
                c.ClientName,
                c.ClientContact,
                c.ClientEmail,
                c.Address as ClientAddress
            FROM order_table o
            LEFT JOIN client_table c ON o.ClientID = c.ID
            WHERE o.OrderNumber = :orderNumber
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->bindValue(':orderNumber', $orderNumber);
        $stmt->execute();
        
        $order = $stmt->fetch();
        
        if (!$order) {
            return null;
        }
        
        // Get order items from cart_table
        $itemsSql = "
            SELECT * FROM cart_table 
            WHERE CartID = :orderNumber AND `Valid Status` = 'valid'
        ";
        $itemsStmt = $db->prepare($itemsSql);
        $itemsStmt->bindValue(':orderNumber', $order['OrderNumber']);
        $itemsStmt->execute();
        $items = $itemsStmt->fetchAll();
        
        return [
            'orderNumber' => $order['OrderNumber'],
            'entryDate' => $order['EntryDate'],
            'entryUser' => $order['EntryUser'],
            'clientId' => $order['ClientID'],
            'clientName' => $order['ClientName'],
            'clientContact' => $order['ClientContact'],
            'clientEmail' => $order['ClientEmail'],
            'clientAddress' => $order['ClientAddress'],
            'status' => $order['Status'],
            'totalAmount' => (float)$order['TotalAmount'],
            'gstAmount' => (float)$order['GSTAmount'],
            'netAmount' => (float)$order['NetAmount'],
            'paidAmount' => (float)$order['PaidAmount'],
            'balanceAmount' => (float)$order['BalanceAmount'],
            'discount' => (float)$order['Discount'],
            'paymentStatus' => $order['PaymentStatus'],
            'orderType' => $order['OrderType'],
            'deliveryDate' => $order['DeliveryDate'],
            'remarks' => $order['Remarks'],
            'items' => array_map(function ($item) {
                return [
                    'id' => $item['CartID'],
                    'adMedium' => $item['AdMedium'],
                    'adType' => $item['adType'],
                    'adCategory' => $item['adCategory'],
                    'quantity' => $item['Quantity'],
                    'width' => (float)$item['Width'],
                    'units' => $item['Units'],
                    'ratePerUnit' => (float)$item['rateperunit'],
                    'amountWithoutGst' => (float)$item['AmountwithoutGst'],
                    'amount' => (float)$item['Amount'],
                    'gstAmount' => (float)$item['GSTAmount'],
                    'gstPercentage' => $item['GST%'],
                    'discountAmount' => (float)$item['DiscountAmount'],
                    'remarks' => $item['Remarks'],
                    'dateOfRelease' => $item['DateOfRelease']
                ];
            }, $items)
        ];
    }

    public function createOrder(string $tenant, array $data): string
    {
        $db = DatabaseManager::getConnection($tenant);
        
        try {
            $db->beginTransaction();
            
            // Generate order number
            $orderNumber = $this->generateOrderNumber($tenant);
            
            // Calculate totals
            $totalAmount = 0;
            $gstAmount = 0;
            $netAmount = 0;
            
            foreach ($data['items'] as $item) {
                $itemTotal = $item['quantity'] * $item['ratePerUnit'];
                $itemGst = ($itemTotal * $item['gstPercentage']) / 100;
                $totalAmount += $itemTotal;
                $gstAmount += $itemGst;
            }
            
            $netAmount = $totalAmount + $gstAmount - ($data['discount'] ?? 0);
            
            // Insert order
            $orderSql = "
                INSERT INTO order_table (
                    OrderNumber,
                    EntryDate,
                    EntryUser,
                    ClientID,
                    Status,
                    TotalAmount,
                    GSTAmount,
                    NetAmount,
                    PaidAmount,
                    BalanceAmount,
                    Discount,
                    PaymentStatus,
                    OrderType,
                    DeliveryDate,
                    Remarks
                ) VALUES (
                    :orderNumber,
                    NOW(),
                    :entryUser,
                    :clientId,
                    :status,
                    :totalAmount,
                    :gstAmount,
                    :netAmount,
                    :paidAmount,
                    :balanceAmount,
                    :discount,
                    :paymentStatus,
                    :orderType,
                    :deliveryDate,
                    :remarks
                )
            ";
            
            $stmt = $db->prepare($orderSql);
            $stmt->execute([
                ':orderNumber' => $orderNumber,
                ':entryUser' => $data['entryUser'] ?? 'System',
                ':clientId' => $data['clientId'],
                ':status' => $data['status'] ?? 'pending',
                ':totalAmount' => $totalAmount,
                ':gstAmount' => $gstAmount,
                ':netAmount' => $netAmount,
                ':paidAmount' => $data['paidAmount'] ?? 0,
                ':balanceAmount' => $netAmount - ($data['paidAmount'] ?? 0),
                ':discount' => $data['discount'] ?? 0,
                ':paymentStatus' => $data['paymentStatus'] ?? 'unpaid',
                ':orderType' => $data['orderType'] ?? 'standard',
                ':deliveryDate' => $data['deliveryDate'] ?? null,
                ':remarks' => $data['remarks'] ?? ''
            ]);
            
            // Insert order items
            foreach ($data['items'] as $item) {
                $itemSql = "
                    INSERT INTO cart_table (
                        CartID,
                        AdMedium,
                        adType,
                        adCategory,
                        Quantity,
                        Width,
                        Units,
                        rateperunit,
                        AmountwithoutGst,
                        Amount,
                        GSTAmount,
                        `GST%`,
                        DiscountAmount,
                        `Valid Status`,
                        entryUser,
                        DateOfRelease,
                        Remarks
                    ) VALUES (
                        :cartId,
                        :adMedium,
                        :adType,
                        :adCategory,
                        :quantity,
                        :width,
                        :units,
                        :ratePerUnit,
                        :amountWithoutGst,
                        :amount,
                        :gstAmount,
                        :gstPercentage,
                        :discountAmount,
                        'valid',
                        :entryUser,
                        :dateOfRelease,
                        :remarks
                    )
                ";
                
                $itemTotal = $item['quantity'] * $item['ratePerUnit'];
                $itemGst = ($itemTotal * $item['gstPercentage']) / 100;
                
                $itemStmt = $db->prepare($itemSql);
                $itemStmt->execute([
                    ':cartId' => $orderNumber,
                    ':adMedium' => $item['adMedium'] ?? '',
                    ':adType' => $item['adType'] ?? '',
                    ':adCategory' => $item['adCategory'] ?? '',
                    ':quantity' => $item['quantity'],
                    ':width' => $item['width'] ?? 0,
                    ':units' => $item['units'] ?? '',
                    ':ratePerUnit' => $item['ratePerUnit'],
                    ':amountWithoutGst' => $itemTotal,
                    ':amount' => $itemTotal + $itemGst,
                    ':gstAmount' => $itemGst,
                    ':gstPercentage' => $item['gstPercentage'],
                    ':discountAmount' => $item['discountAmount'] ?? 0,
                    ':entryUser' => $data['entryUser'] ?? 'System',
                    ':dateOfRelease' => $item['dateOfRelease'] ?? null,
                    ':remarks' => $item['remarks'] ?? ''
                ]);
            }
            
            $db->commit();
            return $orderNumber;
            
        } catch (\Exception $e) {
            $db->rollBack();
            throw $e;
        }
    }

    public function updateOrder(string $tenant, string $orderNumber, array $data): bool
    {
        $db = DatabaseManager::getConnection($tenant);
        
        $sql = "
            UPDATE order_table SET
                Status = :status,
                PaymentStatus = :paymentStatus,
                PaidAmount = :paidAmount,
                BalanceAmount = :balanceAmount,
                DeliveryDate = :deliveryDate,
                Remarks = :remarks
            WHERE OrderNumber = :orderNumber
        ";
        
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([
            ':orderNumber' => $orderNumber,
            ':status' => $data['status'],
            ':paymentStatus' => $data['paymentStatus'],
            ':paidAmount' => $data['paidAmount'],
            ':balanceAmount' => $data['balanceAmount'],
            ':deliveryDate' => $data['deliveryDate'] ?? null,
            ':remarks' => $data['remarks'] ?? ''
        ]);
        
        return $result && $stmt->rowCount() > 0;
    }

    private function generateOrderNumber(string $tenant): string
    {
        $prefix = strtoupper(substr($tenant, 0, 3));
        $timestamp = date('YmdHis');
        $random = str_pad(mt_rand(1, 999), 3, '0', STR_PAD_LEFT);
        return "{$prefix}-{$timestamp}-{$random}";
    }
}
