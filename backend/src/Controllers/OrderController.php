<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Services\OrderService;

class OrderController
{
    private OrderService $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    public function index(Request $request, Response $response): Response
    {
        $tenant = $request->getAttribute('tenant');
        $params = $request->getQueryParams();
        
        try {
            $orders = $this->orderService->getOrders($tenant, $params);
            
            $data = [
                'success' => true,
                'data' => $orders['data'],
                'pagination' => [
                    'total' => $orders['total'],
                    'page' => $params['page'] ?? 1,
                    'limit' => $params['limit'] ?? 50,
                    'totalPages' => ceil($orders['total'] / ($params['limit'] ?? 50))
                ]
            ];
            
            $response->getBody()->write(json_encode($data));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Failed to fetch orders: ' . $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function show(Request $request, Response $response, array $args): Response
    {
        $tenant = $request->getAttribute('tenant');
        $orderId = $args['id'];
        
        try {
            $order = $this->orderService->getOrder($tenant, $orderId);
            
            if (!$order) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'Order not found'
                ]));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $order
            ]));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Failed to fetch order: ' . $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function create(Request $request, Response $response): Response
    {
        $tenant = $request->getAttribute('tenant');
        $data = json_decode($request->getBody()->getContents(), true);
        
        try {
            $orderId = $this->orderService->createOrder($tenant, $data);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => ['id' => $orderId],
                'message' => 'Order created successfully'
            ]));
            return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Failed to create order: ' . $e->getMessage()
            ]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
    }

    public function update(Request $request, Response $response, array $args): Response
    {
        $tenant = $request->getAttribute('tenant');
        $orderId = $args['id'];
        $data = json_decode($request->getBody()->getContents(), true);
        
        try {
            $updated = $this->orderService->updateOrder($tenant, $orderId, $data);
            
            if (!$updated) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'Order not found'
                ]));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'Order updated successfully'
            ]));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Failed to update order: ' . $e->getMessage()
            ]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
    }
}
