<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Services\EmployeeService;

class EmployeeController
{
    private EmployeeService $employeeService;

    public function __construct(EmployeeService $employeeService)
    {
        $this->employeeService = $employeeService;
    }

    public function index(Request $request, Response $response): Response
    {
        $tenant = $request->getAttribute('tenant');
        $params = $request->getQueryParams();
        
        try {
            $employees = $this->employeeService->getEmployees($tenant, $params);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $employees
            ]));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Failed to fetch employees: ' . $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function show(Request $request, Response $response, array $args): Response
    {
        $tenant = $request->getAttribute('tenant');
        $employeeId = $args['id'];
        
        try {
            $employee = $this->employeeService->getEmployee($tenant, $employeeId);
            
            if (!$employee) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'Employee not found'
                ]));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $employee
            ]));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Failed to fetch employee: ' . $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function create(Request $request, Response $response): Response
    {
        $tenant = $request->getAttribute('tenant');
        $data = json_decode($request->getBody()->getContents(), true);
        
        try {
            $employeeId = $this->employeeService->createEmployee($tenant, $data);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => ['id' => $employeeId],
                'message' => 'Employee created successfully'
            ]));
            return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Failed to create employee: ' . $e->getMessage()
            ]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
    }

    public function update(Request $request, Response $response, array $args): Response
    {
        $tenant = $request->getAttribute('tenant');
        $employeeId = $args['id'];
        $data = json_decode($request->getBody()->getContents(), true);
        
        try {
            $updated = $this->employeeService->updateEmployee($tenant, $employeeId, $data);
            
            if (!$updated) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'Employee not found'
                ]));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'Employee updated successfully'
            ]));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Failed to update employee: ' . $e->getMessage()
            ]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
    }

    public function delete(Request $request, Response $response, array $args): Response
    {
        $tenant = $request->getAttribute('tenant');
        $employeeId = $args['id'];
        
        try {
            $deleted = $this->employeeService->deleteEmployee($tenant, $employeeId);
            
            if (!$deleted) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'Employee not found'
                ]));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'Employee deleted successfully'
            ]));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Failed to delete employee: ' . $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function getStats(Request $request, Response $response): Response
    {
        $tenant = $request->getAttribute('tenant');
        
        try {
            $stats = $this->employeeService->getEmployeeStats($tenant);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $stats
            ]));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Failed to fetch employee stats: ' . $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function getPerformance(Request $request, Response $response, array $args): Response
    {
        $tenant = $request->getAttribute('tenant');
        $employeeId = $args['id'];
        $params = $request->getQueryParams();
        
        try {
            $performance = $this->employeeService->getEmployeePerformance($tenant, $employeeId, $params);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $performance
            ]));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Failed to fetch employee performance: ' . $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }
}
