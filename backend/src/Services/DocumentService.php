<?php

namespace App\Services;

use App\Database\DatabaseManager;
use PDO;
use Psr\Http\Message\UploadedFileInterface;

class DocumentService
{
    private string $tenant;
    private string $uploadPath;

    public function __construct(string $tenant = 'easy2work')
    {
        $this->tenant = $tenant;
        $this->uploadPath = __DIR__ . '/../../uploads/' . $tenant . '/';
        
        // Create upload directory if it doesn't exist
        if (!is_dir($this->uploadPath)) {
            mkdir($this->uploadPath, 0755, true);
        }
    }

    private function getConnection(): PDO
    {
        return DatabaseManager::getConnection($this->tenant);
    }

    private function query(string $sql, array $params = []): array
    {
        $pdo = $this->getConnection();
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    private function execute(string $sql, array $params = []): bool
    {
        $pdo = $this->getConnection();
        $stmt = $pdo->prepare($sql);
        return $stmt->execute($params);
    }

    private function insert(string $sql, array $params = []): int
    {
        $pdo = $this->getConnection();
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $pdo->lastInsertId();
    }

    public function getDocuments(int $page = 1, int $limit = 10, string $search = '', string $type = '', string $category = ''): array
    {
        $offset = ($page - 1) * $limit;
        
        $sql = "SELECT d.*, u.name as uploaded_by_name 
                FROM documents d
                LEFT JOIN users u ON d.uploaded_by = u.id
                WHERE 1=1";
        
        $params = [];
        
        if (!empty($search)) {
            $sql .= " AND (d.name LIKE :search OR d.description LIKE :search)";
            $params['search'] = "%$search%";
        }
        
        if (!empty($type)) {
            $sql .= " AND d.type = :type";
            $params['type'] = $type;
        }
        
        if (!empty($category)) {
            $sql .= " AND d.category = :category";
            $params['category'] = $category;
        }
        
        $sql .= " ORDER BY d.created_at DESC LIMIT :limit OFFSET :offset";
        $params['limit'] = $limit;
        $params['offset'] = $offset;
        
        $documents = $this->query($sql, $params);
        
        // Get total count for pagination
        $countSql = "SELECT COUNT(*) as total FROM documents d WHERE 1=1";
        $countParams = [];
        
        if (!empty($search)) {
            $countSql .= " AND (d.name LIKE :search OR d.description LIKE :search)";
            $countParams['search'] = "%$search%";
        }
        
        if (!empty($type)) {
            $countSql .= " AND d.type = :type";
            $countParams['type'] = $type;
        }
        
        if (!empty($category)) {
            $countSql .= " AND d.category = :category";
            $countParams['category'] = $category;
        }
        
        $totalResult = $this->query($countSql, $countParams);
        $total = $totalResult[0]['total'] ?? 0;
        
        return [
            'documents' => $documents,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => (int)$total,
                'pages' => ceil($total / $limit)
            ]
        ];
    }

    public function getDocumentById(int $id): ?array
    {
        $sql = "SELECT d.*, u.name as uploaded_by_name,
                       ds.download_count, ds.last_downloaded
                FROM documents d
                LEFT JOIN users u ON d.uploaded_by = u.id
                LEFT JOIN document_stats ds ON d.id = ds.document_id
                WHERE d.id = :id";
        
        $result = $this->query($sql, ['id' => $id]);
        
        if (empty($result)) {
            return null;
        }
        
        $document = $result[0];
        
        // Get sharing information
        $sharesSQL = "SELECT * FROM document_shares WHERE document_id = :id AND (expires_at IS NULL OR expires_at > NOW())";
        $document['shares'] = $this->query($sharesSQL, ['id' => $id]);
        
        // Get version history if applicable
        $versionsSQL = "SELECT * FROM document_versions WHERE document_id = :id ORDER BY version DESC";
        $document['versions'] = $this->query($versionsSQL, ['id' => $id]);
        
        return $document;
    }

    public function uploadDocument(UploadedFileInterface $file, array $data): array
    {
        // Validate file
        if ($file->getError() !== UPLOAD_ERR_OK) {
            throw new \Exception('File upload error');
        }
        
        $filename = $file->getClientFilename();
        $fileSize = $file->getSize();
        $mimeType = $file->getClientMediaType();
        
        // Generate unique filename
        $fileExtension = pathinfo($filename, PATHINFO_EXTENSION);
        $uniqueFilename = uniqid() . '_' . time() . '.' . $fileExtension;
        $filePath = $this->uploadPath . $uniqueFilename;
        
        // Move uploaded file
        $file->moveTo($filePath);
        
        // Calculate file hash for duplicate detection
        $fileHash = hash_file('sha256', $filePath);
        
        // Check for duplicates
        $duplicateSQL = "SELECT id FROM documents WHERE file_hash = :hash";
        $duplicate = $this->query($duplicateSQL, ['hash' => $fileHash]);
        
        if (!empty($duplicate)) {
            unlink($filePath); // Remove uploaded file
            throw new \Exception('Document already exists');
        }
        
        // Save to database
        $sql = "INSERT INTO documents (
                    name, description, type, category, filename, file_path, 
                    file_size, mime_type, file_hash, uploaded_by, created_at
                ) VALUES (
                    :name, :description, :type, :category, :filename, :file_path,
                    :file_size, :mime_type, :file_hash, :uploaded_by, NOW()
                )";
        
        $documentId = $this->insert($sql, [
            'name' => $data['name'] ?? pathinfo($filename, PATHINFO_FILENAME),
            'description' => $data['description'] ?? null,
            'type' => $data['type'] ?? $this->detectDocumentType($mimeType),
            'category' => $data['category'] ?? 'general',
            'filename' => $filename,
            'file_path' => $uniqueFilename,
            'file_size' => $fileSize,
            'mime_type' => $mimeType,
            'file_hash' => $fileHash,
            'uploaded_by' => $data['uploaded_by'] ?? 1 // Should come from authenticated user
        ]);
        
        // Initialize stats
        $this->execute("INSERT INTO document_stats (document_id, download_count) VALUES (:id, 0)", ['id' => $documentId]);
        
        return $this->getDocumentById($documentId);
    }

    public function generatePDF(int $templateId, array $data, array $options = []): array
    {
        // Get template
        $template = $this->getTemplateById($templateId);
        if (!$template) {
            throw new \Exception('Template not found');
        }
        
        // Process template content with data
        $processedContent = $this->processTemplate($template['content'], $data);
        
        // Generate PDF using a PDF library (e.g., TCPDF, DomPDF)
        $pdfContent = $this->generatePDFFromHTML($processedContent, $options);
        
        // Generate filename
        $filename = ($options['filename'] ?? $template['name']) . '_' . date('Y-m-d_H-i-s') . '.pdf';
        $uniqueFilename = uniqid() . '_' . $filename;
        $filePath = $this->uploadPath . $uniqueFilename;
        
        // Save PDF file
        file_put_contents($filePath, $pdfContent);
        
        // Save to database
        $sql = "INSERT INTO documents (
                    name, description, type, category, filename, file_path, 
                    file_size, mime_type, template_id, generated_data, uploaded_by, created_at
                ) VALUES (
                    :name, :description, 'pdf', :category, :filename, :file_path,
                    :file_size, 'application/pdf', :template_id, :generated_data, :uploaded_by, NOW()
                )";
        
        $documentId = $this->insert($sql, [
            'name' => $options['name'] ?? $template['name'] . ' - Generated',
            'description' => $options['description'] ?? 'Generated from template: ' . $template['name'],
            'category' => $options['category'] ?? 'generated',
            'filename' => $filename,
            'file_path' => $uniqueFilename,
            'file_size' => strlen($pdfContent),
            'template_id' => $templateId,
            'generated_data' => json_encode($data),
            'uploaded_by' => $options['uploaded_by'] ?? 1
        ]);
        
        // Initialize stats
        $this->execute("INSERT INTO document_stats (document_id, download_count) VALUES (:id, 0)", ['id' => $documentId]);
        
        return [
            'document_id' => $documentId,
            'filename' => $filename,
            'file_size' => strlen($pdfContent),
            'download_url' => "/api/documents/{$documentId}/download"
        ];
    }

    public function downloadDocument(int $id): ?array
    {
        $document = $this->getDocumentById($id);
        if (!$document) {
            return null;
        }
        
        $filePath = $this->uploadPath . $document['file_path'];
        if (!file_exists($filePath)) {
            throw new \Exception('File not found on disk');
        }
        
        // Update download stats
        $this->execute("UPDATE document_stats SET download_count = download_count + 1, last_downloaded = NOW() WHERE document_id = :id", ['id' => $id]);
        
        return [
            'content' => file_get_contents($filePath),
            'filename' => $document['filename'],
            'mime_type' => $document['mime_type']
        ];
    }

    public function shareDocument(int $documentId, array $shareData): array
    {
        $document = $this->getDocumentById($documentId);
        if (!$document) {
            throw new \Exception('Document not found');
        }
        
        // Generate share token
        $shareToken = bin2hex(random_bytes(32));
        
        // Set expiration date
        $expiresAt = null;
        if (isset($shareData['expires_in_days'])) {
            $expiresAt = date('Y-m-d H:i:s', strtotime("+{$shareData['expires_in_days']} days"));
        }
        
        // Save share record
        $sql = "INSERT INTO document_shares (
                    document_id, share_token, shared_with, permissions, expires_at, created_by, created_at
                ) VALUES (
                    :document_id, :share_token, :shared_with, :permissions, :expires_at, :created_by, NOW()
                )";
        
        $shareId = $this->insert($sql, [
            'document_id' => $documentId,
            'share_token' => $shareToken,
            'shared_with' => $shareData['shared_with'] ?? null,
            'permissions' => json_encode($shareData['permissions'] ?? ['view']),
            'expires_at' => $expiresAt,
            'created_by' => $shareData['created_by'] ?? 1
        ]);
        
        return [
            'share_id' => $shareId,
            'share_token' => $shareToken,
            'share_url' => "/shared/documents/{$shareToken}",
            'expires_at' => $expiresAt
        ];
    }

    public function deleteDocument(int $id): bool
    {
        $document = $this->getDocumentById($id);
        if (!$document) {
            return false;
        }
        
        // Delete file from disk
        $filePath = $this->uploadPath . $document['file_path'];
        if (file_exists($filePath)) {
            unlink($filePath);
        }
        
        // Delete from database
        $this->execute("DELETE FROM document_shares WHERE document_id = :id", ['id' => $id]);
        $this->execute("DELETE FROM document_stats WHERE document_id = :id", ['id' => $id]);
        $this->execute("DELETE FROM document_versions WHERE document_id = :id", ['id' => $id]);
        $this->execute("DELETE FROM documents WHERE id = :id", ['id' => $id]);
        
        return true;
    }

    public function getTemplates(string $type = '', string $category = ''): array
    {
        $sql = "SELECT * FROM document_templates WHERE 1=1";
        $params = [];
        
        if (!empty($type)) {
            $sql .= " AND type = :type";
            $params['type'] = $type;
        }
        
        if (!empty($category)) {
            $sql .= " AND category = :category";
            $params['category'] = $category;
        }
        
        $sql .= " ORDER BY name";
        
        return $this->query($sql, $params);
    }

    public function createTemplate(array $data): array
    {
        $sql = "INSERT INTO document_templates (
                    name, description, type, category, content, variables, 
                    styles, is_active, created_by, created_at
                ) VALUES (
                    :name, :description, :type, :category, :content, :variables,
                    :styles, :is_active, :created_by, NOW()
                )";
        
        $templateId = $this->insert($sql, [
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'type' => $data['type'],
            'category' => $data['category'] ?? 'general',
            'content' => $data['content'],
            'variables' => json_encode($data['variables'] ?? []),
            'styles' => json_encode($data['styles'] ?? []),
            'is_active' => $data['is_active'] ?? true,
            'created_by' => $data['created_by'] ?? 1
        ]);
        
        return $this->getTemplateById($templateId);
    }

    public function updateTemplate(int $id, array $data): ?array
    {
        $template = $this->getTemplateById($id);
        if (!$template) {
            return null;
        }
        
        $sql = "UPDATE document_templates SET
                    name = :name,
                    description = :description,
                    type = :type,
                    category = :category,
                    content = :content,
                    variables = :variables,
                    styles = :styles,
                    is_active = :is_active,
                    updated_at = NOW()
                WHERE id = :id";
        
        $this->execute($sql, [
            'id' => $id,
            'name' => $data['name'] ?? $template['name'],
            'description' => $data['description'] ?? $template['description'],
            'type' => $data['type'] ?? $template['type'],
            'category' => $data['category'] ?? $template['category'],
            'content' => $data['content'] ?? $template['content'],
            'variables' => json_encode($data['variables'] ?? json_decode($template['variables'], true)),
            'styles' => json_encode($data['styles'] ?? json_decode($template['styles'], true)),
            'is_active' => $data['is_active'] ?? $template['is_active']
        ]);
        
        return $this->getTemplateById($id);
    }

    public function deleteTemplate(int $id): bool
    {
        $template = $this->getTemplateById($id);
        if (!$template) {
            return false;
        }
        
        $sql = "DELETE FROM document_templates WHERE id = :id";
        $this->execute($sql, ['id' => $id]);
        
        return true;
    }

    public function getDocumentStats(string $startDate, string $endDate): array
    {
        $stats = [];
        
        // Documents by type
        $typeSQL = "SELECT type, COUNT(*) as count FROM documents 
                   WHERE created_at BETWEEN :start_date AND :end_date
                   GROUP BY type";
        $typeStats = $this->query($typeSQL, ['start_date' => $startDate, 'end_date' => $endDate]);
        $stats['by_type'] = $typeStats;
        
        // Documents by category
        $categorySQL = "SELECT category, COUNT(*) as count FROM documents 
                       WHERE created_at BETWEEN :start_date AND :end_date
                       GROUP BY category";
        $categoryStats = $this->query($categorySQL, ['start_date' => $startDate, 'end_date' => $endDate]);
        $stats['by_category'] = $categoryStats;
        
        // Storage usage
        $storageSQL = "SELECT 
                         COUNT(*) as total_documents,
                         SUM(file_size) as total_size,
                         AVG(file_size) as avg_size
                       FROM documents";
        $storageStats = $this->query($storageSQL);
        $stats['storage'] = $storageStats[0] ?? [];
        
        // Download stats
        $downloadSQL = "SELECT 
                          SUM(ds.download_count) as total_downloads,
                          AVG(ds.download_count) as avg_downloads_per_doc,
                          COUNT(CASE WHEN ds.download_count > 0 THEN 1 END) as downloaded_documents
                        FROM document_stats ds
                        JOIN documents d ON ds.document_id = d.id
                        WHERE d.created_at BETWEEN :start_date AND :end_date";
        $downloadStats = $this->query($downloadSQL, ['start_date' => $startDate, 'end_date' => $endDate]);
        $stats['downloads'] = $downloadStats[0] ?? [];
        
        // Recent activity
        $recentSQL = "SELECT d.name, d.type, d.created_at, u.name as uploaded_by
                     FROM documents d
                     LEFT JOIN users u ON d.uploaded_by = u.id
                     WHERE d.created_at BETWEEN :start_date AND :end_date
                     ORDER BY d.created_at DESC
                     LIMIT 10";
        $recentStats = $this->query($recentSQL, ['start_date' => $startDate, 'end_date' => $endDate]);
        $stats['recent_activity'] = $recentStats;
        
        return $stats;
    }

    // Private helper methods
    
    private function getTemplateById(int $id): ?array
    {
        $result = $this->query("SELECT * FROM document_templates WHERE id = :id", ['id' => $id]);
        return $result[0] ?? null;
    }
    
    private function processTemplate(string $content, array $data): string
    {
        // Simple variable replacement ({{variable_name}})
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                // Handle nested arrays/objects
                $value = $this->processNestedData($value);
            }
            $content = str_replace("{{$key}}", $value, $content);
        }
        
        return $content;
    }
    
    private function processNestedData(array $data): string
    {
        // Convert array to formatted string for template processing
        $result = '';
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $result .= "$key: " . $this->processNestedData($value) . "\n";
            } else {
                $result .= "$key: $value\n";
            }
        }
        return $result;
    }
    
    private function generatePDFFromHTML(string $html, array $options = []): string
    {
        // This would use a PDF library like TCPDF, DomPDF, or wkhtmltopdf
        // For now, return a simple mock PDF content
        
        $pdfContent = "%PDF-1.4\n";
        $pdfContent .= "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
        $pdfContent .= "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
        $pdfContent .= "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n";
        $pdfContent .= "4 0 obj\n<< /Length " . strlen($html) . " >>\nstream\n";
        $pdfContent .= "BT /F1 12 Tf 100 700 Td (" . strip_tags($html) . ") Tj ET\n";
        $pdfContent .= "endstream\nendobj\n";
        $pdfContent .= "xref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n0000000053 00000 n \n0000000125 00000 n \n0000000229 00000 n \n";
        $pdfContent .= "trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n" . (strlen($pdfContent) + 30) . "\n%%EOF";
        
        return $pdfContent;
    }
    
    private function detectDocumentType(string $mimeType): string
    {
        $typeMap = [
            'application/pdf' => 'pdf',
            'application/msword' => 'document',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'document',
            'application/vnd.ms-excel' => 'spreadsheet',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'spreadsheet',
            'image/jpeg' => 'image',
            'image/png' => 'image',
            'image/gif' => 'image',
            'text/plain' => 'text',
            'text/csv' => 'data'
        ];
        
        return $typeMap[$mimeType] ?? 'other';
    }
}
