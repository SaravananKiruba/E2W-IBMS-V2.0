<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Services\RateService;

class RateController
{
    private RateService $rateService;

    public function __construct(RateService $rateService)
    {
        $this->rateService = $rateService;
    }

    public function index(Request $request, Response $response): Response
    {
        $tenant = $request->getAttribute('tenant');
        $params = $request->getQueryParams();
        
        try {
            $rates = $this->rateService->getRates($tenant, $params);
            
            $data = [
                'success' => true,
                'data' => $rates['data'],
                'pagination' => [
                    'total' => $rates['total'],
                    'page' => $params['page'] ?? 1,
                    'limit' => $params['limit'] ?? 50,
                    'totalPages' => ceil($rates['total'] / ($params['limit'] ?? 50))
                ]
            ];
            
            $response->getBody()->write(json_encode($data));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $error = [
                'success' => false,
                'message' => 'Failed to fetch rates',
                'error' => $e->getMessage()
            ];
            
            $response->getBody()->write(json_encode($error));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function show(Request $request, Response $response, array $args): Response
    {
        $tenant = $request->getAttribute('tenant');
        $rateId = (int)$args['id'];
        
        try {
            $rate = $this->rateService->getRate($tenant, $rateId);
            
            if (!$rate) {
                $error = [
                    'success' => false,
                    'message' => 'Rate not found'
                ];
                
                $response->getBody()->write(json_encode($error));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }
            
            $data = [
                'success' => true,
                'data' => $rate
            ];
            
            $response->getBody()->write(json_encode($data));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $error = [
                'success' => false,
                'message' => 'Failed to fetch rate',
                'error' => $e->getMessage()
            ];
            
            $response->getBody()->write(json_encode($error));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function store(Request $request, Response $response): Response
    {
        $tenant = $request->getAttribute('tenant');
        $data = json_decode($request->getBody()->getContents(), true);
        
        try {
            $rateId = $this->rateService->createRate($tenant, $data);
            
            $result = [
                'success' => true,
                'message' => 'Rate created successfully',
                'data' => ['rateId' => $rateId]
            ];
            
            $response->getBody()->write(json_encode($result));
            return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $error = [
                'success' => false,
                'message' => 'Failed to create rate',
                'error' => $e->getMessage()
            ];
            
            $response->getBody()->write(json_encode($error));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function update(Request $request, Response $response, array $args): Response
    {
        $tenant = $request->getAttribute('tenant');
        $rateId = (int)$args['id'];
        $data = json_decode($request->getBody()->getContents(), true);
        
        try {
            $success = $this->rateService->updateRate($tenant, $rateId, $data);
            
            if (!$success) {
                $error = [
                    'success' => false,
                    'message' => 'Rate not found or update failed'
                ];
                
                $response->getBody()->write(json_encode($error));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }
            
            $result = [
                'success' => true,
                'message' => 'Rate updated successfully'
            ];
            
            $response->getBody()->write(json_encode($result));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $error = [
                'success' => false,
                'message' => 'Failed to update rate',
                'error' => $e->getMessage()
            ];
            
            $response->getBody()->write(json_encode($error));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function delete(Request $request, Response $response, array $args): Response
    {
        $tenant = $request->getAttribute('tenant');
        $rateId = (int)$args['id'];
        
        try {
            $success = $this->rateService->deleteRate($tenant, $rateId);
            
            if (!$success) {
                $error = [
                    'success' => false,
                    'message' => 'Rate not found or deletion failed'
                ];
                
                $response->getBody()->write(json_encode($error));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }
            
            $result = [
                'success' => true,
                'message' => 'Rate deleted successfully'
            ];
            
            $response->getBody()->write(json_encode($result));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $error = [
                'success' => false,
                'message' => 'Failed to delete rate',
                'error' => $e->getMessage()
            ];
            
            $response->getBody()->write(json_encode($error));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function calculateRate(Request $request, Response $response): Response
    {
        $tenant = $request->getAttribute('tenant');
        $data = json_decode($request->getBody()->getContents(), true);
        
        try {
            $calculation = $this->rateService->calculateRate($tenant, $data);
            
            $result = [
                'success' => true,
                'data' => $calculation
            ];
            
            $response->getBody()->write(json_encode($result));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $error = [
                'success' => false,
                'message' => 'Failed to calculate rate',
                'error' => $e->getMessage()
            ];
            
            $response->getBody()->write(json_encode($error));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }
}
