<?php

namespace App\Controllers;

use App\Services\ConsultantService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class ConsultantController
{
    private ConsultantService $consultantService;

    public function __construct(ConsultantService $consultantService)
    {
        $this->consultantService = $consultantService;
    }

    public function getConsultants(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            $page = (int)($queryParams['page'] ?? 1);
            $limit = (int)($queryParams['limit'] ?? 10);
            $search = $queryParams['search'] ?? '';
            $status = $queryParams['status'] ?? '';
            $specialization = $queryParams['specialization'] ?? '';

            $result = $this->consultantService->getConsultants($page, $limit, $search, $status, $specialization);
            
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

    public function getConsultant(Request $request, Response $response, array $args): Response
    {
        try {
            $consultantId = (int)$args['id'];
            $consultant = $this->consultantService->getConsultantById($consultantId);
            
            if (!$consultant) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'Consultant not found'
                ]));
                
                return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
            }
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $consultant
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

    public function createConsultant(Request $request, Response $response): Response
    {
        try {
            $data = json_decode($request->getBody()->getContents(), true);
            
            // Validate required fields
            $required = ['name', 'email', 'specialization', 'hourly_rate'];
            foreach ($required as $field) {
                if (!isset($data[$field]) || empty($data[$field])) {
                    $response->getBody()->write(json_encode([
                        'success' => false,
                        'message' => "Field '$field' is required"
                    ]));
                    
                    return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
                }
            }
            
            $consultant = $this->consultantService->createConsultant($data);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $consultant
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

    public function updateConsultant(Request $request, Response $response, array $args): Response
    {
        try {
            $consultantId = (int)$args['id'];
            $data = json_decode($request->getBody()->getContents(), true);
            
            $consultant = $this->consultantService->updateConsultant($consultantId, $data);
            
            if (!$consultant) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'Consultant not found'
                ]));
                
                return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
            }
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $consultant
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

    public function deleteConsultant(Request $request, Response $response, array $args): Response
    {
        try {
            $consultantId = (int)$args['id'];
            $deleted = $this->consultantService->deleteConsultant($consultantId);
            
            if (!$deleted) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'Consultant not found'
                ]));
                
                return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
            }
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'Consultant deleted successfully'
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

    public function getConsultantStats(Request $request, Response $response): Response
    {
        try {
            $stats = $this->consultantService->getConsultantStats();
            
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

    public function getConsultantPerformance(Request $request, Response $response, array $args): Response
    {
        try {
            $consultantId = (int)$args['id'];
            $queryParams = $request->getQueryParams();
            $startDate = $queryParams['start_date'] ?? date('Y-m-01');
            $endDate = $queryParams['end_date'] ?? date('Y-m-t');
            
            $performance = $this->consultantService->getConsultantPerformance($consultantId, $startDate, $endDate);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $performance
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

    public function assignProject(Request $request, Response $response, array $args): Response
    {
        try {
            $consultantId = (int)$args['id'];
            $data = json_decode($request->getBody()->getContents(), true);
            
            if (!isset($data['project_id'])) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'Project ID is required'
                ]));
                
                return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
            }
            
            $assignment = $this->consultantService->assignProject($consultantId, $data['project_id'], $data);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $assignment
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

    public function updateAvailability(Request $request, Response $response, array $args): Response
    {
        try {
            $consultantId = (int)$args['id'];
            $data = json_decode($request->getBody()->getContents(), true);
            
            $availability = $this->consultantService->updateAvailability($consultantId, $data);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $availability
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
