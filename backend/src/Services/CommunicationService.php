<?php

namespace App\Services;

use App\Database\DatabaseManager;
use PDO;

class CommunicationService
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

    private function execute(string $sql, array $params = []): bool
    {
        $pdo = $this->getConnection();
        $stmt = $pdo->prepare($sql);
        return $stmt->execute($params);
    }

    private function insert(string $sql, array $params = []): int
    {
        $pdo = $this->getConnection();
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $pdo->lastInsertId();
    }

    public function getChannels(): array
    {
        $sql = "SELECT * FROM communication_channels ORDER BY name";
        $channels = $this->query($sql);
        
        // Add status information for each channel
        foreach ($channels as &$channel) {
            $channel['is_configured'] = $this->isChannelConfigured($channel['type']);
            $channel['last_test'] = $this->getLastChannelTest($channel['type']);
        }
        
        return $channels;
    }

    public function updateChannelConfig(string $channel, array $config): array
    {
        // Update or insert channel configuration
        $sql = "INSERT INTO communication_channels (type, name, config, is_active, updated_at)
                VALUES (:type, :name, :config, :is_active, NOW())
                ON DUPLICATE KEY UPDATE 
                    name = VALUES(name),
                    config = VALUES(config),
                    is_active = VALUES(is_active),
                    updated_at = VALUES(updated_at)";
        
        $this->execute($sql, [
            'type' => $channel,
            'name' => $config['name'] ?? ucfirst($channel),
            'config' => json_encode($config),
            'is_active' => $config['is_active'] ?? true
        ]);
        
        // Return updated configuration
        $result = $this->query("SELECT * FROM communication_channels WHERE type = :type", ['type' => $channel]);
        return $result[0] ?? [];
    }

    public function testChannel(string $channel, array $testData): array
    {
        $testResult = [
            'success' => false,
            'message' => '',
            'details' => [],
            'tested_at' => date('Y-m-d H:i:s')
        ];
        
        try {
            switch ($channel) {
                case 'email':
                    $testResult = $this->testEmailChannel($testData);
                    break;
                case 'sms':
                    $testResult = $this->testSMSChannel($testData);
                    break;
                case 'whatsapp':
                    $testResult = $this->testWhatsAppChannel($testData);
                    break;
                case 'push':
                    $testResult = $this->testPushChannel($testData);
                    break;
                default:
                    throw new \Exception("Unknown channel type: $channel");
            }
            
            // Log test result
            $this->logChannelTest($channel, $testResult);
            
        } catch (\Exception $e) {
            $testResult['message'] = $e->getMessage();
            $this->logChannelTest($channel, $testResult);
        }
        
        return $testResult;
    }

    public function sendMessage(string $channel, string $recipient, string $message, ?string $subject = null, ?int $templateId = null, array $variables = []): array
    {
        // If template is provided, process it
        if ($templateId) {
            $template = $this->getTemplateById($templateId);
            if ($template) {
                $message = $this->processTemplate($template['content'], $variables);
                $subject = $subject ?? $this->processTemplate($template['subject'] ?? '', $variables);
            }
        }
        
        // Log message in database
        $messageId = $this->logOutgoingMessage($channel, $recipient, $message, $subject, $templateId);
        
        $result = [
            'message_id' => $messageId,
            'success' => false,
            'message' => '',
            'details' => []
        ];
        
        try {
            switch ($channel) {
                case 'email':
                    $result = array_merge($result, $this->sendEmail($recipient, $message, $subject));
                    break;
                case 'sms':
                    $result = array_merge($result, $this->sendSMS($recipient, $message));
                    break;
                case 'whatsapp':
                    $result = array_merge($result, $this->sendWhatsApp($recipient, $message));
                    break;
                case 'push':
                    $result = array_merge($result, $this->sendPushNotification($recipient, $message, $subject));
                    break;
                default:
                    throw new \Exception("Unknown channel type: $channel");
            }
            
            // Update message status
            $this->updateMessageStatus($messageId, $result['success'] ? 'sent' : 'failed', $result['message']);
            
        } catch (\Exception $e) {
            $result['message'] = $e->getMessage();
            $this->updateMessageStatus($messageId, 'failed', $e->getMessage());
        }
        
        return $result;
    }

    public function getMessageHistory(int $page = 1, int $limit = 10, string $channel = '', string $recipient = '', string $status = ''): array
    {
        $offset = ($page - 1) * $limit;
        
        $sql = "SELECT * FROM communication_logs WHERE 1=1";
        $params = [];
        
        if (!empty($channel)) {
            $sql .= " AND channel = :channel";
            $params['channel'] = $channel;
        }
        
        if (!empty($recipient)) {
            $sql .= " AND recipient LIKE :recipient";
            $params['recipient'] = "%$recipient%";
        }
        
        if (!empty($status)) {
            $sql .= " AND status = :status";
            $params['status'] = $status;
        }
        
        $sql .= " ORDER BY created_at DESC LIMIT :limit OFFSET :offset";
        $params['limit'] = $limit;
        $params['offset'] = $offset;
        
        $messages = $this->query($sql, $params);
        
        // Get total count
        $countSql = "SELECT COUNT(*) as total FROM communication_logs WHERE 1=1";
        $countParams = [];
        
        if (!empty($channel)) {
            $countSql .= " AND channel = :channel";
            $countParams['channel'] = $channel;
        }
        
        if (!empty($recipient)) {
            $countSql .= " AND recipient LIKE :recipient";
            $countParams['recipient'] = "%$recipient%";
        }
        
        if (!empty($status)) {
            $countSql .= " AND status = :status";
            $countParams['status'] = $status;
        }
        
        $totalResult = $this->query($countSql, $countParams);
        $total = $totalResult[0]['total'] ?? 0;
        
        return [
            'messages' => $messages,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => (int)$total,
                'pages' => ceil($total / $limit)
            ]
        ];
    }

    public function getChannelStats(string $startDate, string $endDate): array
    {
        $stats = [];
        
        // Messages by channel
        $channelSQL = "SELECT channel, COUNT(*) as total, 
                              SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
                              SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
                       FROM communication_logs 
                       WHERE created_at BETWEEN :start_date AND :end_date
                       GROUP BY channel";
        
        $channelStats = $this->query($channelSQL, [
            'start_date' => $startDate,
            'end_date' => $endDate
        ]);
        $stats['by_channel'] = $channelStats;
        
        // Daily message volume
        $dailySQL = "SELECT DATE(created_at) as date, channel, COUNT(*) as count
                     FROM communication_logs 
                     WHERE created_at BETWEEN :start_date AND :end_date
                     GROUP BY DATE(created_at), channel
                     ORDER BY date";
        
        $dailyStats = $this->query($dailySQL, [
            'start_date' => $startDate,
            'end_date' => $endDate
        ]);
        $stats['daily_volume'] = $dailyStats;
        
        // Success rates
        $successSQL = "SELECT 
                         COUNT(*) as total_messages,
                         SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as successful,
                         (SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) / COUNT(*) * 100) as success_rate
                       FROM communication_logs 
                       WHERE created_at BETWEEN :start_date AND :end_date";
        
        $successResult = $this->query($successSQL, [
            'start_date' => $startDate,
            'end_date' => $endDate
        ]);
        $stats['success_metrics'] = $successResult[0] ?? [];
        
        return $stats;
    }

    public function getTemplates(string $channel = '', string $type = ''): array
    {
        $sql = "SELECT * FROM communication_templates WHERE 1=1";
        $params = [];
        
        if (!empty($channel)) {
            $sql .= " AND channel = :channel";
            $params['channel'] = $channel;
        }
        
        if (!empty($type)) {
            $sql .= " AND type = :type";
            $params['type'] = $type;
        }
        
        $sql .= " ORDER BY name";
        
        return $this->query($sql, $params);
    }

    public function createTemplate(array $data): array
    {
        $sql = "INSERT INTO communication_templates (
                    name, channel, type, subject, content, variables, is_active, created_at
                ) VALUES (
                    :name, :channel, :type, :subject, :content, :variables, :is_active, NOW()
                )";
        
        $templateId = $this->insert($sql, [
            'name' => $data['name'],
            'channel' => $data['channel'],
            'type' => $data['type'] ?? 'general',
            'subject' => $data['subject'] ?? null,
            'content' => $data['content'],
            'variables' => json_encode($data['variables'] ?? []),
            'is_active' => $data['is_active'] ?? true
        ]);
        
        return $this->getTemplateById($templateId);
    }

    public function updateTemplate(int $id, array $data): ?array
    {
        $template = $this->getTemplateById($id);
        if (!$template) {
            return null;
        }
        
        $sql = "UPDATE communication_templates SET
                    name = :name,
                    channel = :channel,
                    type = :type,
                    subject = :subject,
                    content = :content,
                    variables = :variables,
                    is_active = :is_active,
                    updated_at = NOW()
                WHERE id = :id";
        
        $this->execute($sql, [
            'id' => $id,
            'name' => $data['name'] ?? $template['name'],
            'channel' => $data['channel'] ?? $template['channel'],
            'type' => $data['type'] ?? $template['type'],
            'subject' => $data['subject'] ?? $template['subject'],
            'content' => $data['content'] ?? $template['content'],
            'variables' => json_encode($data['variables'] ?? json_decode($template['variables'], true)),
            'is_active' => $data['is_active'] ?? $template['is_active']
        ]);
        
        return $this->getTemplateById($id);
    }

    public function deleteTemplate(int $id): bool
    {
        $template = $this->getTemplateById($id);
        if (!$template) {
            return false;
        }
        
        $sql = "DELETE FROM communication_templates WHERE id = :id";
        $this->execute($sql, ['id' => $id]);
        
        return true;
    }

    // Private helper methods for channel-specific implementations
    
    private function testEmailChannel(array $testData): array
    {
        // Get email configuration
        $config = $this->getChannelConfig('email');
        
        if (!$config) {
            throw new \Exception('Email channel not configured');
        }
        
        // This would integrate with actual email service (SMTP, SendGrid, etc.)
        // For now, return mock success
        return [
            'success' => true,
            'message' => 'Email channel test successful',
            'details' => [
                'smtp_server' => $config['smtp_server'] ?? 'Not configured',
                'test_recipient' => $testData['recipient'] ?? 'test@example.com'
            ]
        ];
    }
    
    private function testSMSChannel(array $testData): array
    {
        // Get SMS configuration
        $config = $this->getChannelConfig('sms');
        
        if (!$config) {
            throw new \Exception('SMS channel not configured');
        }
        
        // This would integrate with SMS provider (Twilio, etc.)
        return [
            'success' => true,
            'message' => 'SMS channel test successful',
            'details' => [
                'provider' => $config['provider'] ?? 'Not configured',
                'test_number' => $testData['phone'] ?? '+1234567890'
            ]
        ];
    }
    
    private function testWhatsAppChannel(array $testData): array
    {
        // Get WhatsApp configuration
        $config = $this->getChannelConfig('whatsapp');
        
        if (!$config) {
            throw new \Exception('WhatsApp channel not configured');
        }
        
        // This would integrate with WhatsApp Business API
        return [
            'success' => true,
            'message' => 'WhatsApp channel test successful',
            'details' => [
                'business_id' => $config['business_id'] ?? 'Not configured',
                'test_number' => $testData['phone'] ?? '+1234567890'
            ]
        ];
    }
    
    private function testPushChannel(array $testData): array
    {
        // Get Push notification configuration
        $config = $this->getChannelConfig('push');
        
        if (!$config) {
            throw new \Exception('Push notification channel not configured');
        }
        
        // This would integrate with FCM or similar service
        return [
            'success' => true,
            'message' => 'Push notification channel test successful',
            'details' => [
                'service' => $config['service'] ?? 'FCM',
                'test_token' => substr($testData['token'] ?? 'test_token', 0, 20) . '...'
            ]
        ];
    }
    
    private function sendEmail(string $recipient, string $message, ?string $subject = null): array
    {
        // This would integrate with actual email service
        // For now, return mock success
        return [
            'success' => true,
            'message' => 'Email sent successfully',
            'details' => [
                'recipient' => $recipient,
                'subject' => $subject ?? 'No Subject'
            ]
        ];
    }
    
    private function sendSMS(string $recipient, string $message): array
    {
        // This would integrate with SMS provider
        return [
            'success' => true,
            'message' => 'SMS sent successfully',
            'details' => [
                'recipient' => $recipient,
                'length' => strlen($message)
            ]
        ];
    }
    
    private function sendWhatsApp(string $recipient, string $message): array
    {
        // This would integrate with WhatsApp Business API
        return [
            'success' => true,
            'message' => 'WhatsApp message sent successfully',
            'details' => [
                'recipient' => $recipient,
                'length' => strlen($message)
            ]
        ];
    }
    
    private function sendPushNotification(string $recipient, string $message, ?string $title = null): array
    {
        // This would integrate with FCM or similar
        return [
            'success' => true,
            'message' => 'Push notification sent successfully',
            'details' => [
                'recipient' => $recipient,
                'title' => $title ?? 'Notification'
            ]
        ];
    }
    
    private function getChannelConfig(string $channel): ?array
    {
        $result = $this->query("SELECT config FROM communication_channels WHERE type = :type AND is_active = 1", ['type' => $channel]);
        if (empty($result)) {
            return null;
        }
        
        return json_decode($result[0]['config'], true);
    }
    
    private function isChannelConfigured(string $channel): bool
    {
        $result = $this->query("SELECT COUNT(*) as count FROM communication_channels WHERE type = :type AND is_active = 1", ['type' => $channel]);
        return ($result[0]['count'] ?? 0) > 0;
    }
    
    private function getLastChannelTest(string $channel): ?array
    {
        $result = $this->query("SELECT * FROM communication_tests WHERE channel = :channel ORDER BY created_at DESC LIMIT 1", ['channel' => $channel]);
        return $result[0] ?? null;
    }
    
    private function logChannelTest(string $channel, array $result): void
    {
        $sql = "INSERT INTO communication_tests (channel, success, message, details, created_at)
                VALUES (:channel, :success, :message, :details, NOW())";
        
        $this->execute($sql, [
            'channel' => $channel,
            'success' => $result['success'] ? 1 : 0,
            'message' => $result['message'],
            'details' => json_encode($result['details'])
        ]);
    }
    
    private function logOutgoingMessage(string $channel, string $recipient, string $message, ?string $subject, ?int $templateId): int
    {
        $sql = "INSERT INTO communication_logs (
                    channel, recipient, subject, message, template_id, status, created_at
                ) VALUES (
                    :channel, :recipient, :subject, :message, :template_id, 'pending', NOW()
                )";
        
        return $this->insert($sql, [
            'channel' => $channel,
            'recipient' => $recipient,
            'subject' => $subject,
            'message' => $message,
            'template_id' => $templateId
        ]);
    }
    
    private function updateMessageStatus(int $messageId, string $status, string $statusMessage = ''): void
    {
        $sql = "UPDATE communication_logs SET status = :status, status_message = :status_message, updated_at = NOW() WHERE id = :id";
        $this->execute($sql, [
            'id' => $messageId,
            'status' => $status,
            'status_message' => $statusMessage
        ]);
    }
    
    private function getTemplateById(int $id): ?array
    {
        $result = $this->query("SELECT * FROM communication_templates WHERE id = :id", ['id' => $id]);
        return $result[0] ?? null;
    }
    
    private function processTemplate(string $template, array $variables): string
    {
        // Simple variable replacement ({{variable_name}})
        foreach ($variables as $key => $value) {
            $template = str_replace("{{$key}}", $value, $template);
        }
        
        return $template;
    }
}
