<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Services\AuthService;

class AuthController
{
    private AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function login(Request $request, Response $response): Response
    {
        $data = json_decode($request->getBody()->getContents(), true);
        
        // Validate required fields
        if (empty($data['username']) || empty($data['password'])) {
            $error = [
                'success' => false,
                'message' => 'Username and password are required'
            ];
            
            $response->getBody()->write(json_encode($error));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
        
        try {
            $tenant = $data['tenant'] ?? 'easy2work'; // Default tenant
            $result = $this->authService->authenticate($tenant, $data['username'], $data['password']);
            
            if (!$result) {
                $error = [
                    'success' => false,
                    'message' => 'Invalid credentials'
                ];
                
                $response->getBody()->write(json_encode($error));
                return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
            }
            
            $responseData = [
                'success' => true,
                'message' => 'Login successful',
                'data' => $result
            ];
            
            $response->getBody()->write(json_encode($responseData));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $error = [
                'success' => false,
                'message' => 'Authentication failed',
                'error' => $e->getMessage()
            ];
            
            $response->getBody()->write(json_encode($error));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function register(Request $request, Response $response): Response
    {
        $data = json_decode($request->getBody()->getContents(), true);
        
        // Validate required fields
        if (empty($data['username']) || empty($data['password']) || empty($data['email'])) {
            $error = [
                'success' => false,
                'message' => 'Username, email, and password are required'
            ];
            
            $response->getBody()->write(json_encode($error));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
        
        try {
            $tenant = $data['tenant'] ?? 'easy2work'; // Default tenant
            $userId = $this->authService->createUser($tenant, $data);
            
            $result = [
                'success' => true,
                'message' => 'User registered successfully',
                'data' => ['userId' => $userId]
            ];
            
            $response->getBody()->write(json_encode($result));
            return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $error = [
                'success' => false,
                'message' => 'Registration failed',
                'error' => $e->getMessage()
            ];
            
            $response->getBody()->write(json_encode($error));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function refresh(Request $request, Response $response): Response
    {
        $data = json_decode($request->getBody()->getContents(), true);
        
        if (empty($data['refreshToken'])) {
            $error = [
                'success' => false,
                'message' => 'Refresh token is required'
            ];
            
            $response->getBody()->write(json_encode($error));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
        
        try {
            $result = $this->authService->refreshToken($data['refreshToken']);
            
            if (!$result) {
                $error = [
                    'success' => false,
                    'message' => 'Invalid refresh token'
                ];
                
                $response->getBody()->write(json_encode($error));
                return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
            }
            
            $responseData = [
                'success' => true,
                'message' => 'Token refreshed successfully',
                'data' => $result
            ];
            
            $response->getBody()->write(json_encode($responseData));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $error = [
                'success' => false,
                'message' => 'Token refresh failed',
                'error' => $e->getMessage()
            ];
            
            $response->getBody()->write(json_encode($error));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function logout(Request $request, Response $response): Response
    {
        $data = json_decode($request->getBody()->getContents(), true);
        
        try {
            if (!empty($data['token'])) {
                $this->authService->revokeToken($data['token']);
            }
            
            $result = [
                'success' => true,
                'message' => 'Logged out successfully'
            ];
            
            $response->getBody()->write(json_encode($result));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $error = [
                'success' => false,
                'message' => 'Logout failed',
                'error' => $e->getMessage()
            ];
            
            $response->getBody()->write(json_encode($error));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function me(Request $request, Response $response): Response
    {
        try {
            $user = $request->getAttribute('user');
            
            if (!$user) {
                $error = [
                    'success' => false,
                    'message' => 'User not found'
                ];
                
                $response->getBody()->write(json_encode($error));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }
            
            $result = [
                'success' => true,
                'data' => $user
            ];
            
            $response->getBody()->write(json_encode($result));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $error = [
                'success' => false,
                'message' => 'Failed to get user info',
                'error' => $e->getMessage()
            ];
            
            $response->getBody()->write(json_encode($error));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }
}
