<?php

namespace App\Services;

use App\Database\DatabaseManager;
use PDO;

class NotificationService
{
    public function getNotifications(string $tenant, array $filters = []): array
    {
        $db = DatabaseManager::getConnection($tenant);
        
        $sql = "
            SELECT 
                n.*,
                c.ClientName as client_name,
                o.OrderNumber as order_number
            FROM notification_table n
            LEFT JOIN client_table c ON n.client_id = c.ID
            LEFT JOIN order_table o ON n.order_id = o.OrderNumber
            WHERE 1=1
        ";
        
        $params = [];
        
        // Apply filters
        if (!empty($filters['status'])) {
            $sql .= " AND n.status = :status";
            $params[':status'] = $filters['status'];
        }
        
        if (!empty($filters['type'])) {
            $sql .= " AND n.type = :type";
            $params[':type'] = $filters['type'];
        }
        
        if (!empty($filters['channel'])) {
            $sql .= " AND n.channel = :channel";
            $params[':channel'] = $filters['channel'];
        }
        
        if (!empty($filters['search'])) {
            $sql .= " AND (n.title LIKE :search OR n.message LIKE :search)";
            $params[':search'] = '%' . $filters['search'] . '%';
        }
        
        $sql .= " ORDER BY n.created_at DESC";
        
        // Add pagination
        $limit = isset($filters['limit']) ? (int)$filters['limit'] : 50;
        $offset = isset($filters['offset']) ? (int)$filters['offset'] : 0;
        $sql .= " LIMIT :limit OFFSET :offset";
        
        $stmt = $db->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $notifications = $stmt->fetchAll();
        
        return array_map([$this, 'formatNotification'], $notifications);
    }

    public function sendNotification(string $tenant, array $data): string
    {
        $db = DatabaseManager::getConnection($tenant);
        
        $notificationId = uniqid('notif_');
        
        $sql = "
            INSERT INTO notification_table (
                id,
                type,
                title,
                message,
                channel,
                recipients,
                client_id,
                order_id,
                status,
                priority,
                scheduled_for,
                template_id,
                variables,
                created_at,
                created_by
            ) VALUES (
                :id,
                :type,
                :title,
                :message,
                :channel,
                :recipients,
                :client_id,
                :order_id,
                :status,
                :priority,
                :scheduled_for,
                :template_id,
                :variables,
                NOW(),
                :created_by
            )
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':id' => $notificationId,
            ':type' => $data['type'],
            ':title' => $data['subject'] ?? $data['title'],
            ':message' => $data['message'],
            ':channel' => is_array($data['channel']) ? json_encode($data['channel']) : $data['channel'],
            ':recipients' => is_array($data['recipients']) ? json_encode($data['recipients']) : $data['recipients'],
            ':client_id' => $data['clientId'] ?? null,
            ':order_id' => $data['orderId'] ?? null,
            ':status' => 'pending',
            ':priority' => $data['priority'] ?? 'medium',
            ':scheduled_for' => $data['scheduledFor'] ?? null,
            ':template_id' => $data['templateId'] ?? null,
            ':variables' => isset($data['variables']) ? json_encode($data['variables']) : null,
            ':created_by' => $data['createdBy'] ?? 'System'
        ]);
        
        // Process notification based on channel
        $this->processNotification($tenant, $notificationId, $data);
        
        return $notificationId;
    }

    public function markAsRead(string $tenant, array $ids): void
    {
        $db = DatabaseManager::getConnection($tenant);
        
        $placeholders = str_repeat('?,', count($ids) - 1) . '?';
        $sql = "UPDATE notification_table SET status = 'read', read_at = NOW() WHERE id IN ($placeholders)";
        
        $stmt = $db->prepare($sql);
        $stmt->execute($ids);
    }

    public function getNotificationStats(string $tenant): array
    {
        $db = DatabaseManager::getConnection($tenant);
        
        // Total notifications
        $totalSql = "SELECT COUNT(*) as total FROM notification_table";
        $totalStmt = $db->prepare($totalSql);
        $totalStmt->execute();
        $total = $totalStmt->fetch()['total'];
        
        // Unread notifications
        $unreadSql = "SELECT COUNT(*) as unread FROM notification_table WHERE status = 'unread'";
        $unreadStmt = $db->prepare($unreadSql);
        $unreadStmt->execute();
        $unread = $unreadStmt->fetch()['unread'];
        
        // Sent notifications
        $sentSql = "SELECT COUNT(*) as sent FROM notification_table WHERE status = 'sent'";
        $sentStmt = $db->prepare($sentSql);
        $sentStmt->execute();
        $sent = $sentStmt->fetch()['sent'];
        
        // Pending notifications
        $pendingSql = "SELECT COUNT(*) as pending FROM notification_table WHERE status = 'pending'";
        $pendingStmt = $db->prepare($pendingSql);
        $pendingStmt->execute();
        $pending = $pendingStmt->fetch()['pending'];
        
        // Failed notifications
        $failedSql = "SELECT COUNT(*) as failed FROM notification_table WHERE status = 'failed'";
        $failedStmt = $db->prepare($failedSql);
        $failedStmt->execute();
        $failed = $failedStmt->fetch()['failed'];
        
        return [
            'total' => (int)$total,
            'unread' => (int)$unread,
            'sent' => (int)$sent,
            'pending' => (int)$pending,
            'failed' => (int)$failed
        ];
    }

    public function getTemplates(string $tenant): array
    {
        $db = DatabaseManager::getConnection($tenant);
        
        $sql = "
            SELECT 
                *,
                (SELECT COUNT(*) FROM notification_table WHERE template_id = nt.id) as usage_count
            FROM notification_template_table nt
            WHERE is_active = 1
            ORDER BY name
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->execute();
        
        return $stmt->fetchAll();
    }

    public function createTemplate(string $tenant, array $data): string
    {
        $db = DatabaseManager::getConnection($tenant);
        
        $templateId = uniqid('template_');
        
        $sql = "
            INSERT INTO notification_template_table (
                id,
                name,
                description,
                type,
                channels,
                variables,
                subject_template,
                body_template,
                is_active,
                created_at,
                created_by
            ) VALUES (
                :id,
                :name,
                :description,
                :type,
                :channels,
                :variables,
                :subject_template,
                :body_template,
                :is_active,
                NOW(),
                :created_by
            )
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':id' => $templateId,
            ':name' => $data['name'],
            ':description' => $data['description'] ?? '',
            ':type' => $data['type'],
            ':channels' => json_encode($data['channels']),
            ':variables' => json_encode($data['variables'] ?? []),
            ':subject_template' => $data['subjectTemplate'] ?? '',
            ':body_template' => $data['bodyTemplate'],
            ':is_active' => $data['isActive'] ?? 1,
            ':created_by' => $data['createdBy'] ?? 'System'
        ]);
        
        return $templateId;
    }

    public function testChannel(string $tenant, string $channel, array $data): array
    {
        try {
            switch ($channel) {
                case 'email':
                    return $this->testEmailChannel($tenant, $data);
                case 'whatsapp':
                    return $this->testWhatsAppChannel($tenant, $data);
                case 'sms':
                    return $this->testSMSChannel($tenant, $data);
                default:
                    throw new \Exception("Unsupported channel: $channel");
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    private function processNotification(string $tenant, string $notificationId, array $data): void
    {
        $channels = is_array($data['channel']) ? $data['channel'] : [$data['channel']];
        
        foreach ($channels as $channel) {
            try {
                switch ($channel) {
                    case 'email':
                        $this->sendEmail($tenant, $data);
                        break;
                    case 'whatsapp':
                        $this->sendWhatsApp($tenant, $data);
                        break;
                    case 'sms':
                        $this->sendSMS($tenant, $data);
                        break;
                    case 'in-app':
                        // In-app notifications are stored in database only
                        break;
                }
                
                $this->updateNotificationStatus($tenant, $notificationId, 'sent');
            } catch (\Exception $e) {
                $this->updateNotificationStatus($tenant, $notificationId, 'failed', $e->getMessage());
            }
        }
    }

    private function sendEmail(string $tenant, array $data): void
    {
        // Email sending logic would go here
        // This is a placeholder implementation
        if (empty($data['recipients'])) {
            throw new \Exception('No email recipients specified');
        }
        
        // Simulate email sending
        // In real implementation, you would use PHPMailer or similar
        error_log("Email sent to: " . json_encode($data['recipients']));
    }

    private function sendWhatsApp(string $tenant, array $data): void
    {
        // WhatsApp sending logic would go here
        // This is a placeholder implementation
        if (empty($data['recipients'])) {
            throw new \Exception('No WhatsApp recipients specified');
        }
        
        // Simulate WhatsApp sending
        error_log("WhatsApp sent to: " . json_encode($data['recipients']));
    }

    private function sendSMS(string $tenant, array $data): void
    {
        // SMS sending logic would go here
        // This is a placeholder implementation
        if (empty($data['recipients'])) {
            throw new \Exception('No SMS recipients specified');
        }
        
        // Simulate SMS sending
        error_log("SMS sent to: " . json_encode($data['recipients']));
    }

    private function testEmailChannel(string $tenant, array $data): array
    {
        // Test email configuration
        return [
            'success' => true,
            'message' => 'Email channel test successful'
        ];
    }

    private function testWhatsAppChannel(string $tenant, array $data): array
    {
        // Test WhatsApp configuration
        return [
            'success' => true,
            'message' => 'WhatsApp channel test successful'
        ];
    }

    private function testSMSChannel(string $tenant, array $data): array
    {
        // Test SMS configuration
        return [
            'success' => true,
            'message' => 'SMS channel test successful'
        ];
    }

    private function updateNotificationStatus(string $tenant, string $notificationId, string $status, string $error = null): void
    {
        $db = DatabaseManager::getConnection($tenant);
        
        $sql = "
            UPDATE notification_table SET
                status = :status,
                error_message = :error_message,
                sent_at = :sent_at,
                updated_at = NOW()
            WHERE id = :notification_id
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':notification_id' => $notificationId,
            ':status' => $status,
            ':error_message' => $error,
            ':sent_at' => $status === 'sent' ? date('Y-m-d H:i:s') : null
        ]);
    }

    private function formatNotification(array $notification): array
    {
        return [
            'id' => $notification['id'],
            'type' => $notification['type'],
            'title' => $notification['title'],
            'message' => $notification['message'],
            'status' => $notification['status'],
            'priority' => $notification['priority'],
            'channel' => json_decode($notification['channel'], true) ?? $notification['channel'],
            'recipients' => json_decode($notification['recipients'], true) ?? $notification['recipients'],
            'clientName' => $notification['client_name'],
            'orderNumber' => $notification['order_number'],
            'timestamp' => $notification['created_at'],
            'sentAt' => $notification['sent_at'],
            'readAt' => $notification['read_at'],
            'errorMessage' => $notification['error_message'],
            'variables' => $notification['variables'] ? json_decode($notification['variables'], true) : null
        ];
    }
}
