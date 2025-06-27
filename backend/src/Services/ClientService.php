<?php

namespace App\Services;

use App\Database\DatabaseManager;
use PDO;

class ClientService
{
    public function getClients(string $tenant, array $params = []): array
    {
        $db = DatabaseManager::getConnection($tenant);
        
        $page = max(1, (int)($params['page'] ?? 1));
        $limit = min(100, max(10, (int)($params['limit'] ?? 50)));
        $offset = ($page - 1) * $limit;
        
        $whereClause = '1=1';
        $bindings = [];
        
        // Search functionality
        if (!empty($params['search'])) {
            $whereClause .= ' AND (ClientName LIKE :search OR ClientEmail LIKE :search OR Address LIKE :search)';
            $bindings[':search'] = '%' . $params['search'] . '%';
        }
        
        // Status filter
        if (!empty($params['status'])) {
            $whereClause .= ' AND Validity = :status';
            $bindings[':status'] = $params['status'] === 'active' ? 1 : 0;
        }
        
        // Date range filter
        if (!empty($params['dateFrom'])) {
            $whereClause .= ' AND DATE(EntryDateTime) >= :dateFrom';
            $bindings[':dateFrom'] = $params['dateFrom'];
        }
        
        if (!empty($params['dateTo'])) {
            $whereClause .= ' AND DATE(EntryDateTime) <= :dateTo';
            $bindings[':dateTo'] = $params['dateTo'];
        }
        
        // Get total count
        $countSql = "SELECT COUNT(*) as total FROM client_table WHERE {$whereClause}";
        $countStmt = $db->prepare($countSql);
        $countStmt->execute($bindings);
        $total = $countStmt->fetch()['total'];
        
        // Get paginated data
        $sql = "
            SELECT 
                ID,
                EntryDateTime,
                EntryUser,
                ClientContact,
                ClientName,
                ClientEmail,
                Address,
                ClientGST,
                ClientPAN,
                Source,
                ConsultantId,
                Validity,
                Gender,
                Age,
                AgeFormat
            FROM client_table 
            WHERE {$whereClause}
            ORDER BY EntryDateTime DESC
            LIMIT :limit OFFSET :offset
        ";
        
        $stmt = $db->prepare($sql);
        foreach ($bindings as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $clients = $stmt->fetchAll();
        
        // Format the data
        $formattedClients = array_map(function ($client) {
            return [
                'id' => $client['ID'],
                'entryDate' => $client['EntryDateTime'],
                'entryUser' => $client['EntryUser'],
                'clientName' => $client['ClientName'],
                'clientContact' => $client['ClientContact'],
                'clientEmail' => $client['ClientEmail'],
                'address' => $client['Address'],
                'gst' => $client['ClientGST'],
                'pan' => $client['ClientPAN'],
                'source' => $client['Source'],
                'consultantId' => $client['ConsultantId'],
                'status' => $client['Validity'] ? 'active' : 'inactive',
                'gender' => $client['Gender'],
                'age' => $client['Age'],
                'ageFormat' => $client['AgeFormat']
            ];
        }, $clients);
        
        return [
            'data' => $formattedClients,
            'total' => $total
        ];
    }

    public function getClient(string $tenant, int $clientId): ?array
    {
        $db = DatabaseManager::getConnection($tenant);
        
        $sql = "
            SELECT 
                ID,
                EntryDateTime,
                EntryUser,
                ClientContact,
                ClientName,
                ClientEmail,
                Address,
                ClientGST,
                ClientPAN,
                Source,
                ConsultantId,
                Validity,
                Gender,
                Age,
                AgeFormat,
                DOB,
                Title,
                ClientContactPerson,
                Attended,
                AttendedDateTime
            FROM client_table 
            WHERE ID = :id
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->bindValue(':id', $clientId, PDO::PARAM_INT);
        $stmt->execute();
        
        $client = $stmt->fetch();
        
        if (!$client) {
            return null;
        }
        
        return [
            'id' => $client['ID'],
            'entryDate' => $client['EntryDateTime'],
            'entryUser' => $client['EntryUser'],
            'clientName' => $client['ClientName'],
            'clientContact' => $client['ClientContact'],
            'clientEmail' => $client['ClientEmail'],
            'address' => $client['Address'],
            'gst' => $client['ClientGST'],
            'pan' => $client['ClientPAN'],
            'source' => $client['Source'],
            'consultantId' => $client['ConsultantId'],
            'status' => $client['Validity'] ? 'active' : 'inactive',
            'gender' => $client['Gender'],
            'age' => $client['Age'],
            'ageFormat' => $client['AgeFormat'],
            'dob' => $client['DOB'],
            'title' => $client['Title'],
            'contactPerson' => $client['ClientContactPerson'],
            'attended' => $client['Attended'],
            'attendedDateTime' => $client['AttendedDateTime']
        ];
    }

    public function createClient(string $tenant, array $data): int
    {
        $db = DatabaseManager::getConnection($tenant);
        
        $sql = "
            INSERT INTO client_table (
                EntryDateTime,
                EntryUser,
                ClientContact,
                ClientName,
                ClientEmail,
                Address,
                ClientGST,
                ClientPAN,
                Source,
                ConsultantId,
                Validity,
                Gender,
                Age,
                AgeFormat,
                DOB,
                Title,
                ClientContactPerson,
                Attended
            ) VALUES (
                NOW(),
                :entryUser,
                :clientContact,
                :clientName,
                :clientEmail,
                :address,
                :gst,
                :pan,
                :source,
                :consultantId,
                :validity,
                :gender,
                :age,
                :ageFormat,
                :dob,
                :title,
                :contactPerson,
                :attended
            )
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':entryUser' => $data['entryUser'] ?? 'System',
            ':clientContact' => $data['clientContact'] ?? '',
            ':clientName' => $data['clientName'],
            ':clientEmail' => $data['clientEmail'] ?? '',
            ':address' => $data['address'] ?? '',
            ':gst' => $data['gst'] ?? '',
            ':pan' => $data['pan'] ?? '',
            ':source' => $data['source'] ?? 'Direct',
            ':consultantId' => $data['consultantId'] ?? 0,
            ':validity' => $data['status'] === 'active' ? 1 : 0,
            ':gender' => $data['gender'] ?? '',
            ':age' => $data['age'] ?? 0,
            ':ageFormat' => $data['ageFormat'] ?? 'Years',
            ':dob' => $data['dob'] ?? null,
            ':title' => $data['title'] ?? '',
            ':contactPerson' => $data['contactPerson'] ?? '',
            ':attended' => $data['attended'] ?? 0
        ]);
        
        return $db->lastInsertId();
    }

    public function updateClient(string $tenant, int $clientId, array $data): bool
    {
        $db = DatabaseManager::getConnection($tenant);
        
        $sql = "
            UPDATE client_table SET
                ClientContact = :clientContact,
                ClientName = :clientName,
                ClientEmail = :clientEmail,
                Address = :address,
                ClientGST = :gst,
                ClientPAN = :pan,
                Source = :source,
                ConsultantId = :consultantId,
                Validity = :validity,
                Gender = :gender,
                Age = :age,
                AgeFormat = :ageFormat,
                DOB = :dob,
                Title = :title,
                ClientContactPerson = :contactPerson,
                Attended = :attended
            WHERE ID = :id
        ";
        
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([
            ':id' => $clientId,
            ':clientContact' => $data['clientContact'] ?? '',
            ':clientName' => $data['clientName'],
            ':clientEmail' => $data['clientEmail'] ?? '',
            ':address' => $data['address'] ?? '',
            ':gst' => $data['gst'] ?? '',
            ':pan' => $data['pan'] ?? '',
            ':source' => $data['source'] ?? 'Direct',
            ':consultantId' => $data['consultantId'] ?? 0,
            ':validity' => $data['status'] === 'active' ? 1 : 0,
            ':gender' => $data['gender'] ?? '',
            ':age' => $data['age'] ?? 0,
            ':ageFormat' => $data['ageFormat'] ?? 'Years',
            ':dob' => $data['dob'] ?? null,
            ':title' => $data['title'] ?? '',
            ':contactPerson' => $data['contactPerson'] ?? '',
            ':attended' => $data['attended'] ?? 0
        ]);
        
        return $result && $stmt->rowCount() > 0;
    }

    public function deleteClient(string $tenant, int $clientId): bool
    {
        $db = DatabaseManager::getConnection($tenant);
        
        // Soft delete by setting validity to 0
        $sql = "UPDATE client_table SET Validity = 0 WHERE ID = :id";
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([':id' => $clientId]);
        
        return $result && $stmt->rowCount() > 0;
    }
}
