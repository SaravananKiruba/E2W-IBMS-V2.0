<?php

namespace App\Controllers;

use App\Services\DocumentService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class DocumentController
{
    private DocumentService $documentService;

    public function __construct(DocumentService $documentService)
    {
        $this->documentService = $documentService;
    }

    public function getDocuments(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            $page = (int)($queryParams['page'] ?? 1);
            $limit = (int)($queryParams['limit'] ?? 10);
            $search = $queryParams['search'] ?? '';
            $type = $queryParams['type'] ?? '';
            $category = $queryParams['category'] ?? '';

            $result = $this->documentService->getDocuments($page, $limit, $search, $type, $category);
            
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

    public function getDocument(Request $request, Response $response, array $args): Response
    {
        try {
            $documentId = (int)$args['id'];
            $document = $this->documentService->getDocumentById($documentId);
            
            if (!$document) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'Document not found'
                ]));
                
                return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
            }
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $document
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

    public function uploadDocument(Request $request, Response $response): Response
    {
        try {
            $uploadedFiles = $request->getUploadedFiles();
            $data = $request->getParsedBody();
            
            if (empty($uploadedFiles['file'])) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'No file uploaded'
                ]));
                
                return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
            }
            
            $file = $uploadedFiles['file'];
            $document = $this->documentService->uploadDocument($file, $data);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $document
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

    public function generatePDF(Request $request, Response $response): Response
    {
        try {
            $data = json_decode($request->getBody()->getContents(), true);
            
            // Validate required fields
            $required = ['template_id', 'data'];
            foreach ($required as $field) {
                if (!isset($data[$field])) {
                    $response->getBody()->write(json_encode([
                        'success' => false,
                        'message' => "Field '$field' is required"
                    ]));
                    
                    return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
                }
            }
            
            $result = $this->documentService->generatePDF(
                $data['template_id'],
                $data['data'],
                $data['options'] ?? []
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

    public function downloadDocument(Request $request, Response $response, array $args): Response
    {
        try {
            $documentId = (int)$args['id'];
            $fileData = $this->documentService->downloadDocument($documentId);
            
            if (!$fileData) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'Document not found'
                ]));
                
                return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
            }
            
            $response->getBody()->write($fileData['content']);
            
            return $response
                ->withHeader('Content-Type', $fileData['mime_type'])
                ->withHeader('Content-Disposition', 'attachment; filename="' . $fileData['filename'] . '"')
                ->withHeader('Content-Length', (string)strlen($fileData['content']));
                
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
            $type = $queryParams['type'] ?? '';
            $category = $queryParams['category'] ?? '';
            
            $templates = $this->documentService->getTemplates($type, $category);
            
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
            $required = ['name', 'type', 'content'];
            foreach ($required as $field) {
                if (!isset($data[$field]) || empty($data[$field])) {
                    $response->getBody()->write(json_encode([
                        'success' => false,
                        'message' => "Field '$field' is required"
                    ]));
                    
                    return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
                }
            }
            
            $template = $this->documentService->createTemplate($data);
            
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
            
            $template = $this->documentService->updateTemplate($templateId, $data);
            
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
            $deleted = $this->documentService->deleteTemplate($templateId);
            
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

    public function getDocumentStats(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            $startDate = $queryParams['start_date'] ?? date('Y-m-01');
            $endDate = $queryParams['end_date'] ?? date('Y-m-t');
            
            $stats = $this->documentService->getDocumentStats($startDate, $endDate);
            
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

    public function shareDocument(Request $request, Response $response, array $args): Response
    {
        try {
            $documentId = (int)$args['id'];
            $data = json_decode($request->getBody()->getContents(), true);
            
            $shareLink = $this->documentService->shareDocument($documentId, $data);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $shareLink
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

    public function deleteDocument(Request $request, Response $response, array $args): Response
    {
        try {
            $documentId = (int)$args['id'];
            $deleted = $this->documentService->deleteDocument($documentId);
            
            if (!$deleted) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'Document not found'
                ]));
                
                return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
            }
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'Document deleted successfully'
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
