<?php

namespace App\Controllers;

use App\Services\CommunicationService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class CommunicationController
{
    private CommunicationService $communicationService;

    public function __construct(CommunicationService $communicationService)
    {
        $this->communicationService = $communicationService;
    }

    public function getChannels(Request $request, Response $response): Response
    {
        try {
            $channels = $this->communicationService->getChannels();
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $channels
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

    public function updateChannelConfig(Request $request, Response $response, array $args): Response
    {
        try {
            $channel = $args['channel'];
            $data = json_decode($request->getBody()->getContents(), true);
            
            $config = $this->communicationService->updateChannelConfig($channel, $data);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $config
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

    public function testChannel(Request $request, Response $response, array $args): Response
    {
        try {
            $channel = $args['channel'];
            $data = json_decode($request->getBody()->getContents(), true);
            
            $result = $this->communicationService->testChannel($channel, $data);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $result
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

    public function sendMessage(Request $request, Response $response): Response
    {
        try {
            $data = json_decode($request->getBody()->getContents(), true);
            
            // Validate required fields
            $required = ['channel', 'recipient', 'message'];
            foreach ($required as $field) {
                if (!isset($data[$field]) || empty($data[$field])) {
                    $response->getBody()->write(json_encode([
                        'success' => false,
                        'message' => "Field '$field' is required"
                    ]));
                    
                    return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
                }
            }
            
            $result = $this->communicationService->sendMessage(
                $data['channel'],
                $data['recipient'],
                $data['message'],
                $data['subject'] ?? null,
                $data['template_id'] ?? null,
                $data['variables'] ?? []
            );
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $result
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

    public function getMessageHistory(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            $page = (int)($queryParams['page'] ?? 1);
            $limit = (int)($queryParams['limit'] ?? 10);
            $channel = $queryParams['channel'] ?? '';
            $recipient = $queryParams['recipient'] ?? '';
            $status = $queryParams['status'] ?? '';

            $result = $this->communicationService->getMessageHistory($page, $limit, $channel, $recipient, $status);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $result
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

    public function getChannelStats(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            $startDate = $queryParams['start_date'] ?? date('Y-m-01');
            $endDate = $queryParams['end_date'] ?? date('Y-m-t');
            
            $stats = $this->communicationService->getChannelStats($startDate, $endDate);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $stats
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

    public function getTemplates(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            $channel = $queryParams['channel'] ?? '';
            $type = $queryParams['type'] ?? '';
            
            $templates = $this->communicationService->getTemplates($channel, $type);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $templates
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

    public function createTemplate(Request $request, Response $response): Response
    {
        try {
            $data = json_decode($request->getBody()->getContents(), true);
            
            // Validate required fields
            $required = ['name', 'channel', 'content'];
            foreach ($required as $field) {
                if (!isset($data[$field]) || empty($data[$field])) {
                    $response->getBody()->write(json_encode([
                        'success' => false,
                        'message' => "Field '$field' is required"
                    ]));
                    
                    return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
                }
            }
            
            $template = $this->communicationService->createTemplate($data);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $template
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }

    public function updateTemplate(Request $request, Response $response, array $args): Response
    {
        try {
            $templateId = (int)$args['id'];
            $data = json_decode($request->getBody()->getContents(), true);
            
            $template = $this->communicationService->updateTemplate($templateId, $data);
            
            if (!$template) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'Template not found'
                ]));
                
                return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
            }
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $template
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

    public function deleteTemplate(Request $request, Response $response, array $args): Response
    {
        try {
            $templateId = (int)$args['id'];
            $deleted = $this->communicationService->deleteTemplate($templateId);
            
            if (!$deleted) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'Template not found'
                ]));
                
                return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
            }
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'Template deleted successfully'
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
}
