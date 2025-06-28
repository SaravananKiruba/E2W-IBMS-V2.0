<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Services\NotificationService;

class NotificationController
{
    private NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function index(Request $request, Response $response): Response
    {
        $tenant = $request->getAttribute('tenant');
        $params = $request->getQueryParams();
        
        try {
            $notifications = $this->notificationService->getNotifications($tenant, $params);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $notifications
            ]));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Failed to fetch notifications: ' . $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function send(Request $request, Response $response): Response
    {
        $tenant = $request->getAttribute('tenant');
        $data = json_decode($request->getBody()->getContents(), true);
        
        try {
            $notificationId = $this->notificationService->sendNotification($tenant, $data);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => ['id' => $notificationId],
                'message' => 'Notification sent successfully'
            ]));
            return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Failed to send notification: ' . $e->getMessage()
            ]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
    }

    public function markAsRead(Request $request, Response $response): Response
    {
        $tenant = $request->getAttribute('tenant');
        $data = json_decode($request->getBody()->getContents(), true);
        
        try {
            $this->notificationService->markAsRead($tenant, $data['ids']);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'Notifications marked as read'
            ]));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Failed to mark notifications as read: ' . $e->getMessage()
            ]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
    }

    public function getStats(Request $request, Response $response): Response
    {
        $tenant = $request->getAttribute('tenant');
        
        try {
            $stats = $this->notificationService->getNotificationStats($tenant);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $stats
            ]));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Failed to fetch notification stats: ' . $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function getTemplates(Request $request, Response $response): Response
    {
        $tenant = $request->getAttribute('tenant');
        
        try {
            $templates = $this->notificationService->getTemplates($tenant);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $templates
            ]));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Failed to fetch templates: ' . $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function createTemplate(Request $request, Response $response): Response
    {
        $tenant = $request->getAttribute('tenant');
        $data = json_decode($request->getBody()->getContents(), true);
        
        try {
            $templateId = $this->notificationService->createTemplate($tenant, $data);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => ['id' => $templateId],
                'message' => 'Template created successfully'
            ]));
            return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Failed to create template: ' . $e->getMessage()
            ]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
    }

    public function testChannel(Request $request, Response $response, array $args): Response
    {
        $tenant = $request->getAttribute('tenant');
        $channel = $args['channel'];
        $data = json_decode($request->getBody()->getContents(), true);
        
        try {
            $result = $this->notificationService->testChannel($tenant, $channel, $data);
            
            $response->getBody()->write(json_encode([
                'success' => $result['success'],
                'message' => $result['message']
            ]));
            
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Failed to test channel: ' . $e->getMessage()
            ]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
    }
}
