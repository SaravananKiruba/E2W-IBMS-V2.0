<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Services\ClientService;

class ClientController
{
    private ClientService $clientService;

    public function __construct(ClientService $clientService)
    {
        $this->clientService = $clientService;
    }

    public function index(Request $request, Response $response): Response
    {
        $tenant = $request->getAttribute('tenant');
        $params = $request->getQueryParams();
        
        try {
            $clients = $this->clientService->getClients($tenant, $params);
            
            $data = [
                'success' => true,
                'data' => $clients['data'],
                'pagination' => [
                    'total' => $clients['total'],
                    'page' => $params['page'] ?? 1,
                    'limit' => $params['limit'] ?? 50,
                    'totalPages' => ceil($clients['total'] / ($params['limit'] ?? 50))
                ]
            ];
            
            $response->getBody()->write(json_encode($data));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Failed to fetch clients: ' . $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function show(Request $request, Response $response, array $args): Response
    {
        $tenant = $request->getAttribute('tenant');
        $clientId = $args['id'];
        
        try {
            $client = $this->clientService->getClient($tenant, $clientId);
            
            if (!$client) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'Client not found'
                ]));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $client
            ]));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Failed to fetch client: ' . $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function create(Request $request, Response $response): Response
    {
        $tenant = $request->getAttribute('tenant');
        $data = json_decode($request->getBody()->getContents(), true);
        
        try {
            $clientId = $this->clientService->createClient($tenant, $data);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => ['id' => $clientId],
                'message' => 'Client created successfully'
            ]));
            return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Failed to create client: ' . $e->getMessage()
            ]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
    }

    public function update(Request $request, Response $response, array $args): Response
    {
        $tenant = $request->getAttribute('tenant');
        $clientId = $args['id'];
        $data = json_decode($request->getBody()->getContents(), true);
        
        try {
            $updated = $this->clientService->updateClient($tenant, $clientId, $data);
            
            if (!$updated) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'Client not found'
                ]));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'Client updated successfully'
            ]));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Failed to update client: ' . $e->getMessage()
            ]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
    }

    public function delete(Request $request, Response $response, array $args): Response
    {
        $tenant = $request->getAttribute('tenant');
        $clientId = $args['id'];
        
        try {
            $deleted = $this->clientService->deleteClient($tenant, $clientId);
            
            if (!$deleted) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'Client not found'
                ]));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'Client deleted successfully'
            ]));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Failed to delete client: ' . $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }
}
