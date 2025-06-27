<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Services\FinanceService;

class FinanceController
{
    private FinanceService $financeService;

    public function __construct(FinanceService $financeService)
    {
        $this->financeService = $financeService;
    }

    public function getTransactions(Request $request, Response $response): Response
    {
        $tenant = $request->getAttribute('tenant');
        $params = $request->getQueryParams();
        
        try {
            $transactions = $this->financeService->getTransactions($tenant, $params);
            
            $data = [
                'success' => true,
                'data' => $transactions['data'],
                'pagination' => [
                    'total' => $transactions['total'],
                    'page' => $params['page'] ?? 1,
                    'limit' => $params['limit'] ?? 50,
                    'totalPages' => ceil($transactions['total'] / ($params['limit'] ?? 50))
                ]
            ];
            
            $response->getBody()->write(json_encode($data));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $error = [
                'success' => false,
                'message' => 'Failed to fetch transactions',
                'error' => $e->getMessage()
            ];
            
            $response->getBody()->write(json_encode($error));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function getLedger(Request $request, Response $response): Response
    {
        $tenant = $request->getAttribute('tenant');
        $params = $request->getQueryParams();
        
        try {
            $ledger = $this->financeService->getLedger($tenant, $params);
            
            $data = [
                'success' => true,
                'data' => $ledger
            ];
            
            $response->getBody()->write(json_encode($data));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $error = [
                'success' => false,
                'message' => 'Failed to fetch ledger',
                'error' => $e->getMessage()
            ];
            
            $response->getBody()->write(json_encode($error));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function recordPayment(Request $request, Response $response): Response
    {
        $tenant = $request->getAttribute('tenant');
        $data = json_decode($request->getBody()->getContents(), true);
        
        try {
            $paymentId = $this->financeService->recordPayment($tenant, $data);
            
            $result = [
                'success' => true,
                'message' => 'Payment recorded successfully',
                'data' => ['paymentId' => $paymentId]
            ];
            
            $response->getBody()->write(json_encode($result));
            return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $error = [
                'success' => false,
                'message' => 'Failed to record payment',
                'error' => $e->getMessage()
            ];
            
            $response->getBody()->write(json_encode($error));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function getFinancialSummary(Request $request, Response $response): Response
    {
        $tenant = $request->getAttribute('tenant');
        $params = $request->getQueryParams();
        
        try {
            $summary = $this->financeService->getFinancialSummary($tenant, $params);
            
            $data = [
                'success' => true,
                'data' => $summary
            ];
            
            $response->getBody()->write(json_encode($data));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $error = [
                'success' => false,
                'message' => 'Failed to fetch financial summary',
                'error' => $e->getMessage()
            ];
            
            $response->getBody()->write(json_encode($error));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function getBalanceSheet(Request $request, Response $response): Response
    {
        $tenant = $request->getAttribute('tenant');
        $params = $request->getQueryParams();
        
        try {
            $balanceSheet = $this->financeService->getBalanceSheet($tenant, $params);
            
            $data = [
                'success' => true,
                'data' => $balanceSheet
            ];
            
            $response->getBody()->write(json_encode($data));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            $error = [
                'success' => false,
                'message' => 'Failed to fetch balance sheet',
                'error' => $e->getMessage()
            ];
            
            $response->getBody()->write(json_encode($error));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }
}
