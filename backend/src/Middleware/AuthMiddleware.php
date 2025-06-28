<?php

namespace App\Middleware;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use App\Services\AuthService;

class AuthMiddleware
{
    private AuthService $authService;

    public function __construct()
    {
        $this->authService = new AuthService();
    }

    public function __invoke(Request $request, RequestHandler $handler): Response
    {
        $authHeader = $request->getHeaderLine('Authorization');
        if (!$authHeader || !preg_match('/Bearer\s(.*)$/i', $authHeader, $matches)) {
            return $this->unauthorized();
        }
        
        $token = $matches[1];
        
        try {
            $user = $this->authService->getUserFromToken($token);
            if (!$user) {
                return $this->unauthorized();
            }
            
            $request = $request->withAttribute('user', $user);
        } catch (\Exception $e) {
            return $this->unauthorized();
        }
        
        return $handler->handle($request);
    }

    private function unauthorized(): Response
    {
        $response = new \Slim\Psr7\Response();
        $response->getBody()->write(json_encode([
            'success' => false,
            'message' => 'Unauthorized',
        ]));
        return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
    }
}
