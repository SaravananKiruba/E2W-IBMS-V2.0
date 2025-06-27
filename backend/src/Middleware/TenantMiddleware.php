<?php

namespace App\Middleware;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;

class TenantMiddleware
{
    public function __invoke(Request $request, RequestHandler $handler): Response
    {
        // Extract tenant from request (e.g., from header or route)
        $tenant = $request->getHeaderLine('X-Tenant') ?: ($request->getQueryParams()['tenant'] ?? 'test');
        if (!$tenant) {
            $tenant = 'test';
        }
        // Set tenant in request attribute for downstream usage
        $request = $request->withAttribute('tenant', $tenant);
        return $handler->handle($request);
    }
}
