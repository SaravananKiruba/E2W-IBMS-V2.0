<?php

namespace App\Services;

use App\Database\DatabaseManager;
use PDO;

class RateService
{
    public function getRates(string $tenant, array $params = []): array
    {
        $db = DatabaseManager::getConnection($tenant);
        
        $page = max(1, (int)($params['page'] ?? 1));
        $limit = min(100, max(10, (int)($params['limit'] ?? 50)));
        $offset = ($page - 1) * $limit;
        
        $whereClause = '1=1';
        $bindings = [];
        
        // Search functionality
        if (!empty($params['search'])) {
            $whereClause .= ' AND (AdType LIKE :search OR AdCategory LIKE :search OR AdMedium LIKE :search)';
            $bindings[':search'] = '%' . $params['search'] . '%';
        }
        
        // Status filter
        if (!empty($params['status'])) {
            $whereClause .= ' AND ValidityStatus = :status';
            $bindings[':status'] = $params['status'] === 'active' ? 1 : 0;
        }
        
        // Medium filter
        if (!empty($params['medium'])) {
            $whereClause .= ' AND AdMedium = :medium';
            $bindings[':medium'] = $params['medium'];
        }
        
        // Get total count
        $countSql = "SELECT COUNT(*) as total FROM rate_table WHERE {$whereClause}";
        $countStmt = $db->prepare($countSql);
        $countStmt->execute($bindings);
        $total = $countStmt->fetch()['total'];
        
        // Get paginated data
        $sql = "
            SELECT 
                ID,
                EntryDate,
                EntryUser,
                AdMedium,
                AdType,
                AdCategory,
                Rate,
                Unit,
                GST,
                ValidFrom,
                ValidTill,
                ValidityStatus,
                Scheme,
                MinQuantity,
                MaxQuantity,
                DiscountPercentage
            FROM rate_table 
            WHERE {$whereClause}
            ORDER BY EntryDate DESC, AdMedium ASC, AdType ASC
            LIMIT :limit OFFSET :offset
        ";
        
        $stmt = $db->prepare($sql);
        foreach ($bindings as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $rates = $stmt->fetchAll();
        
        // Format the data
        $formattedRates = array_map(function ($rate) {
            return [
                'id' => $rate['ID'],
                'entryDate' => $rate['EntryDate'],
                'entryUser' => $rate['EntryUser'],
                'adMedium' => $rate['AdMedium'],
                'adType' => $rate['AdType'],
                'adCategory' => $rate['AdCategory'],
                'rate' => (float)$rate['Rate'],
                'unit' => $rate['Unit'],
                'gst' => (float)$rate['GST'],
                'validFrom' => $rate['ValidFrom'],
                'validTill' => $rate['ValidTill'],
                'status' => $rate['ValidityStatus'] ? 'active' : 'inactive',
                'scheme' => $rate['Scheme'],
                'minQuantity' => (int)$rate['MinQuantity'],
                'maxQuantity' => (int)$rate['MaxQuantity'],
                'discountPercentage' => (float)$rate['DiscountPercentage']
            ];
        }, $rates);
        
        return [
            'data' => $formattedRates,
            'total' => $total
        ];
    }

    public function getRate(string $tenant, int $rateId): ?array
    {
        $db = DatabaseManager::getConnection($tenant);
        
        $sql = "
            SELECT 
                ID,
                EntryDate,
                EntryUser,
                AdMedium,
                AdType,
                AdCategory,
                Rate,
                Unit,
                GST,
                ValidFrom,
                ValidTill,
                ValidityStatus,
                Scheme,
                MinQuantity,
                MaxQuantity,
                DiscountPercentage
            FROM rate_table 
            WHERE ID = :id
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->bindValue(':id', $rateId, PDO::PARAM_INT);
        $stmt->execute();
        
        $rate = $stmt->fetch();
        
        if (!$rate) {
            return null;
        }
        
        return [
            'id' => $rate['ID'],
            'entryDate' => $rate['EntryDate'],
            'entryUser' => $rate['EntryUser'],
            'adMedium' => $rate['AdMedium'],
            'adType' => $rate['AdType'],
            'adCategory' => $rate['AdCategory'],
            'rate' => (float)$rate['Rate'],
            'unit' => $rate['Unit'],
            'gst' => (float)$rate['GST'],
            'validFrom' => $rate['ValidFrom'],
            'validTill' => $rate['ValidTill'],
            'status' => $rate['ValidityStatus'] ? 'active' : 'inactive',
            'scheme' => $rate['Scheme'],
            'minQuantity' => (int)$rate['MinQuantity'],
            'maxQuantity' => (int)$rate['MaxQuantity'],
            'discountPercentage' => (float)$rate['DiscountPercentage']
        ];
    }

    public function createRate(string $tenant, array $data): int
    {
        $db = DatabaseManager::getConnection($tenant);
        
        $sql = "
            INSERT INTO rate_table (
                EntryDate,
                EntryUser,
                AdMedium,
                AdType,
                AdCategory,
                Rate,
                Unit,
                GST,
                ValidFrom,
                ValidTill,
                ValidityStatus,
                Scheme,
                MinQuantity,
                MaxQuantity,
                DiscountPercentage
            ) VALUES (
                NOW(),
                :entryUser,
                :adMedium,
                :adType,
                :adCategory,
                :rate,
                :unit,
                :gst,
                :validFrom,
                :validTill,
                :validityStatus,
                :scheme,
                :minQuantity,
                :maxQuantity,
                :discountPercentage
            )
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':entryUser' => $data['entryUser'] ?? 'System',
            ':adMedium' => $data['adMedium'],
            ':adType' => $data['adType'],
            ':adCategory' => $data['adCategory'],
            ':rate' => $data['rate'],
            ':unit' => $data['unit'] ?? 'Per Unit',
            ':gst' => $data['gst'] ?? 18.0,
            ':validFrom' => $data['validFrom'] ?? date('Y-m-d'),
            ':validTill' => $data['validTill'] ?? null,
            ':validityStatus' => $data['status'] === 'active' ? 1 : 0,
            ':scheme' => $data['scheme'] ?? 'Standard',
            ':minQuantity' => $data['minQuantity'] ?? 1,
            ':maxQuantity' => $data['maxQuantity'] ?? 999999,
            ':discountPercentage' => $data['discountPercentage'] ?? 0
        ]);
        
        return $db->lastInsertId();
    }

    public function updateRate(string $tenant, int $rateId, array $data): bool
    {
        $db = DatabaseManager::getConnection($tenant);
        
        $sql = "
            UPDATE rate_table SET
                AdMedium = :adMedium,
                AdType = :adType,
                AdCategory = :adCategory,
                Rate = :rate,
                Unit = :unit,
                GST = :gst,
                ValidFrom = :validFrom,
                ValidTill = :validTill,
                ValidityStatus = :validityStatus,
                Scheme = :scheme,
                MinQuantity = :minQuantity,
                MaxQuantity = :maxQuantity,
                DiscountPercentage = :discountPercentage
            WHERE ID = :id
        ";
        
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([
            ':id' => $rateId,
            ':adMedium' => $data['adMedium'],
            ':adType' => $data['adType'],
            ':adCategory' => $data['adCategory'],
            ':rate' => $data['rate'],
            ':unit' => $data['unit'] ?? 'Per Unit',
            ':gst' => $data['gst'] ?? 18.0,
            ':validFrom' => $data['validFrom'] ?? date('Y-m-d'),
            ':validTill' => $data['validTill'] ?? null,
            ':validityStatus' => $data['status'] === 'active' ? 1 : 0,
            ':scheme' => $data['scheme'] ?? 'Standard',
            ':minQuantity' => $data['minQuantity'] ?? 1,
            ':maxQuantity' => $data['maxQuantity'] ?? 999999,
            ':discountPercentage' => $data['discountPercentage'] ?? 0
        ]);
        
        return $result && $stmt->rowCount() > 0;
    }

    public function deleteRate(string $tenant, int $rateId): bool
    {
        $db = DatabaseManager::getConnection($tenant);
        
        // Soft delete by setting validity to 0
        $sql = "UPDATE rate_table SET ValidityStatus = 0 WHERE ID = :id";
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([':id' => $rateId]);
        
        return $result && $stmt->rowCount() > 0;
    }

    public function calculateRate(string $tenant, array $data): array
    {
        $db = DatabaseManager::getConnection($tenant);
        
        // Find applicable rate
        $sql = "
            SELECT *
            FROM rate_table 
            WHERE AdMedium = :medium 
            AND AdType = :type 
            AND AdCategory = :category
            AND ValidityStatus = 1
            AND (ValidFrom IS NULL OR ValidFrom <= CURDATE())
            AND (ValidTill IS NULL OR ValidTill >= CURDATE())
            AND MinQuantity <= :quantity
            AND MaxQuantity >= :quantity
            ORDER BY Rate ASC
            LIMIT 1
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':medium' => $data['adMedium'],
            ':type' => $data['adType'],
            ':category' => $data['adCategory'],
            ':quantity' => $data['quantity'] ?? 1
        ]);
        
        $rate = $stmt->fetch();
        
        if (!$rate) {
            throw new \Exception('No applicable rate found for the given criteria');
        }
        
        $quantity = (float)($data['quantity'] ?? 1);
        $width = (float)($data['width'] ?? 1);
        $baseRate = (float)$rate['Rate'];
        $gstPercentage = (float)$rate['GST'];
        $discountPercentage = (float)$rate['DiscountPercentage'];
        
        // Calculate base amount
        $baseAmount = $quantity * $width * $baseRate;
        
        // Apply discount
        $discountAmount = ($baseAmount * $discountPercentage) / 100;
        $amountAfterDiscount = $baseAmount - $discountAmount;
        
        // Calculate GST
        $gstAmount = ($amountAfterDiscount * $gstPercentage) / 100;
        
        // Final amount
        $finalAmount = $amountAfterDiscount + $gstAmount;
        
        return [
            'rateDetails' => [
                'id' => $rate['ID'],
                'adMedium' => $rate['AdMedium'],
                'adType' => $rate['AdType'],
                'adCategory' => $rate['AdCategory'],
                'baseRate' => $baseRate,
                'unit' => $rate['Unit'],
                'scheme' => $rate['Scheme']
            ],
            'calculation' => [
                'quantity' => $quantity,
                'width' => $width,
                'baseAmount' => round($baseAmount, 2),
                'discountPercentage' => $discountPercentage,
                'discountAmount' => round($discountAmount, 2),
                'amountAfterDiscount' => round($amountAfterDiscount, 2),
                'gstPercentage' => $gstPercentage,
                'gstAmount' => round($gstAmount, 2),
                'finalAmount' => round($finalAmount, 2)
            ]
        ];
    }

    public function getActiveMediums(string $tenant): array
    {
        $db = DatabaseManager::getConnection($tenant);
        
        $sql = "
            SELECT DISTINCT AdMedium
            FROM rate_table 
            WHERE ValidityStatus = 1
            ORDER BY AdMedium
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->execute();
        
        return array_column($stmt->fetchAll(), 'AdMedium');
    }

    public function getTypesByMedium(string $tenant, string $medium): array
    {
        $db = DatabaseManager::getConnection($tenant);
        
        $sql = "
            SELECT DISTINCT AdType
            FROM rate_table 
            WHERE AdMedium = :medium 
            AND ValidityStatus = 1
            ORDER BY AdType
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([':medium' => $medium]);
        
        return array_column($stmt->fetchAll(), 'AdType');
    }

    public function getCategoriesByType(string $tenant, string $medium, string $type): array
    {
        $db = DatabaseManager::getConnection($tenant);
        
        $sql = "
            SELECT DISTINCT AdCategory
            FROM rate_table 
            WHERE AdMedium = :medium 
            AND AdType = :type 
            AND ValidityStatus = 1
            ORDER BY AdCategory
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':medium' => $medium,
            ':type' => $type
        ]);
        
        return array_column($stmt->fetchAll(), 'AdCategory');
    }
}
