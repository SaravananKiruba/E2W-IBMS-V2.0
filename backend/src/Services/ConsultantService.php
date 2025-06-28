<?php

namespace App\Services;

use App\Database\DatabaseManager;
use PDO;

class ConsultantService
{
    private string $tenant;

    public function __construct(string $tenant = 'easy2work')
    {
        $this->tenant = $tenant;
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

    public function getConsultants(int $page = 1, int $limit = 10, string $search = '', string $status = '', string $specialization = ''): array
    {
        $offset = ($page - 1) * $limit;
        
        $sql = "SELECT c.*, 
                       COUNT(DISTINCT p.id) as active_projects,
                       AVG(r.rating) as avg_rating,
                       COUNT(DISTINCT r.id) as total_reviews
                FROM consultants c
                LEFT JOIN project_assignments pa ON c.id = pa.consultant_id AND pa.status = 'active'
                LEFT JOIN projects p ON pa.project_id = p.id
                LEFT JOIN consultant_reviews r ON c.id = r.consultant_id
                WHERE 1=1";
        
        $params = [];
        
        if (!empty($search)) {
            $sql .= " AND (c.name LIKE :search OR c.email LIKE :search OR c.specialization LIKE :search)";
            $params['search'] = "%$search%";
        }
        
        if (!empty($status)) {
            $sql .= " AND c.status = :status";
            $params['status'] = $status;
        }
        
        if (!empty($specialization)) {
            $sql .= " AND c.specialization = :specialization";
            $params['specialization'] = $specialization;
        }
        
        $sql .= " GROUP BY c.id ORDER BY c.created_at DESC LIMIT :limit OFFSET :offset";
        $params['limit'] = $limit;
        $params['offset'] = $offset;
        
        $consultants = $this->query($sql, $params);
        
        // Get total count for pagination
        $countSql = "SELECT COUNT(DISTINCT c.id) as total FROM consultants c WHERE 1=1";
        $countParams = [];
        
        if (!empty($search)) {
            $countSql .= " AND (c.name LIKE :search OR c.email LIKE :search OR c.specialization LIKE :search)";
            $countParams['search'] = "%$search%";
        }
        
        if (!empty($status)) {
            $countSql .= " AND c.status = :status";
            $countParams['status'] = $status;
        }
        
        if (!empty($specialization)) {
            $countSql .= " AND c.specialization = :specialization";
            $countParams['specialization'] = $specialization;
        }
        
        $totalResult = $this->query($countSql, $countParams);
        $total = $totalResult[0]['total'] ?? 0;
        
        return [
            'consultants' => $consultants,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => (int)$total,
                'pages' => ceil($total / $limit)
            ]
        ];
    }

    public function getConsultantById(int $id): ?array
    {
        $sql = "SELECT c.*, 
                       COUNT(DISTINCT p.id) as active_projects,
                       AVG(r.rating) as avg_rating,
                       COUNT(DISTINCT r.id) as total_reviews,
                       SUM(CASE WHEN pa.status = 'completed' THEN 1 ELSE 0 END) as completed_projects
                FROM consultants c
                LEFT JOIN project_assignments pa ON c.id = pa.consultant_id
                LEFT JOIN projects p ON pa.project_id = p.id AND pa.status = 'active'
                LEFT JOIN consultant_reviews r ON c.id = r.consultant_id
                WHERE c.id = :id
                GROUP BY c.id";
        
        $result = $this->query($sql, ['id' => $id]);
        
        if (empty($result)) {
            return null;
        }
        
        $consultant = $result[0];
        
        // Get availability schedule
        $availabilitySQL = "SELECT * FROM consultant_availability WHERE consultant_id = :id ORDER BY day_of_week";
        $consultant['availability'] = $this->query($availabilitySQL, ['id' => $id]);
        
        // Get recent projects
        $projectsSQL = "SELECT p.*, pa.role, pa.start_date, pa.end_date, pa.status as assignment_status
                        FROM projects p
                        JOIN project_assignments pa ON p.id = pa.project_id
                        WHERE pa.consultant_id = :id
                        ORDER BY pa.created_at DESC
                        LIMIT 5";
        $consultant['recent_projects'] = $this->query($projectsSQL, ['id' => $id]);
        
        // Get skills
        $skillsSQL = "SELECT s.* FROM skills s
                      JOIN consultant_skills cs ON s.id = cs.skill_id
                      WHERE cs.consultant_id = :id";
        $consultant['skills'] = $this->query($skillsSQL, ['id' => $id]);
        
        return $consultant;
    }

    public function createConsultant(array $data): array
    {
        $sql = "INSERT INTO consultants (
                    name, email, phone, specialization, hourly_rate, experience_years,
                    bio, linkedin_url, portfolio_url, status, created_at
                ) VALUES (
                    :name, :email, :phone, :specialization, :hourly_rate, :experience_years,
                    :bio, :linkedin_url, :portfolio_url, :status, NOW()
                )";
        
        $params = [
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'specialization' => $data['specialization'],
            'hourly_rate' => $data['hourly_rate'],
            'experience_years' => $data['experience_years'] ?? 0,
            'bio' => $data['bio'] ?? null,
            'linkedin_url' => $data['linkedin_url'] ?? null,
            'portfolio_url' => $data['portfolio_url'] ?? null,
            'status' => $data['status'] ?? 'active'
        ];
        
        $consultantId = $this->insert($sql, $params);
        
        // Handle skills if provided
        if (!empty($data['skills'])) {
            $this->updateConsultantSkills($consultantId, $data['skills']);
        }
        
        // Handle availability if provided
        if (!empty($data['availability'])) {
            $this->updateConsultantAvailability($consultantId, $data['availability']);
        }
        
        return $this->getConsultantById($consultantId);
    }

    public function updateConsultant(int $id, array $data): ?array
    {
        $consultant = $this->getConsultantById($id);
        if (!$consultant) {
            return null;
        }
        
        $sql = "UPDATE consultants SET
                    name = :name,
                    email = :email,
                    phone = :phone,
                    specialization = :specialization,
                    hourly_rate = :hourly_rate,
                    experience_years = :experience_years,
                    bio = :bio,
                    linkedin_url = :linkedin_url,
                    portfolio_url = :portfolio_url,
                    status = :status,
                    updated_at = NOW()
                WHERE id = :id";
        
        $params = [
            'id' => $id,
            'name' => $data['name'] ?? $consultant['name'],
            'email' => $data['email'] ?? $consultant['email'],
            'phone' => $data['phone'] ?? $consultant['phone'],
            'specialization' => $data['specialization'] ?? $consultant['specialization'],
            'hourly_rate' => $data['hourly_rate'] ?? $consultant['hourly_rate'],
            'experience_years' => $data['experience_years'] ?? $consultant['experience_years'],
            'bio' => $data['bio'] ?? $consultant['bio'],
            'linkedin_url' => $data['linkedin_url'] ?? $consultant['linkedin_url'],
            'portfolio_url' => $data['portfolio_url'] ?? $consultant['portfolio_url'],
            'status' => $data['status'] ?? $consultant['status']
        ];
        
        $this->execute($sql, $params);
        
        // Update skills if provided
        if (isset($data['skills'])) {
            $this->updateConsultantSkills($id, $data['skills']);
        }
        
        // Update availability if provided
        if (isset($data['availability'])) {
            $this->updateConsultantAvailability($id, $data['availability']);
        }
        
        return $this->getConsultantById($id);
    }

    public function deleteConsultant(int $id): bool
    {
        $consultant = $this->getConsultantById($id);
        if (!$consultant) {
            return false;
        }
        
        // Check if consultant has active projects
        $activeProjectsSQL = "SELECT COUNT(*) as count FROM project_assignments 
                             WHERE consultant_id = :id AND status = 'active'";
        $result = $this->query($activeProjectsSQL, ['id' => $id]);
        
        if ($result[0]['count'] > 0) {
            throw new \Exception('Cannot delete consultant with active projects');
        }
        
        // Delete related records
        $this->execute("DELETE FROM consultant_skills WHERE consultant_id = :id", ['id' => $id]);
        $this->execute("DELETE FROM consultant_availability WHERE consultant_id = :id", ['id' => $id]);
        
        // Soft delete consultant
        $sql = "UPDATE consultants SET status = 'deleted', updated_at = NOW() WHERE id = :id";
        $this->execute($sql, ['id' => $id]);
        
        return true;
    }

    public function getConsultantStats(): array
    {
        $stats = [];
        
        // Total consultants by status
        $statusSQL = "SELECT status, COUNT(*) as count FROM consultants GROUP BY status";
        $statusResults = $this->query($statusSQL);
        $stats['by_status'] = array_column($statusResults, 'count', 'status');
        
        // Consultants by specialization
        $specializationSQL = "SELECT specialization, COUNT(*) as count FROM consultants 
                             WHERE status != 'deleted' GROUP BY specialization";
        $specializationResults = $this->query($specializationSQL);
        $stats['by_specialization'] = array_column($specializationResults, 'count', 'specialization');
        
        // Average hourly rate
        $rateSQL = "SELECT AVG(hourly_rate) as avg_rate, MIN(hourly_rate) as min_rate, 
                          MAX(hourly_rate) as max_rate FROM consultants WHERE status = 'active'";
        $rateResult = $this->query($rateSQL);
        $stats['hourly_rates'] = $rateResult[0];
        
        // Performance metrics
        $performanceSQL = "SELECT 
                             COUNT(DISTINCT c.id) as total_active,
                             AVG(r.rating) as avg_rating,
                             COUNT(DISTINCT pa.id) as total_assignments
                           FROM consultants c
                           LEFT JOIN consultant_reviews r ON c.id = r.consultant_id
                           LEFT JOIN project_assignments pa ON c.id = pa.consultant_id
                           WHERE c.status = 'active'";
        $performanceResult = $this->query($performanceSQL);
        $stats['performance'] = $performanceResult[0];
        
        return $stats;
    }

    public function getConsultantPerformance(int $consultantId, string $startDate, string $endDate): array
    {
        $performance = [];
        
        // Project completion stats
        $projectSQL = "SELECT 
                         COUNT(*) as total_projects,
                         SUM(CASE WHEN pa.status = 'completed' THEN 1 ELSE 0 END) as completed_projects,
                         SUM(CASE WHEN pa.status = 'active' THEN 1 ELSE 0 END) as active_projects,
                         AVG(DATEDIFF(pa.end_date, pa.start_date)) as avg_project_duration
                       FROM project_assignments pa
                       WHERE pa.consultant_id = :consultant_id
                         AND pa.created_at BETWEEN :start_date AND :end_date";
        
        $projectResult = $this->query($projectSQL, [
            'consultant_id' => $consultantId,
            'start_date' => $startDate,
            'end_date' => $endDate
        ]);
        $performance['projects'] = $projectResult[0];
        
        // Revenue generated
        $revenueSQL = "SELECT 
                         SUM(pa.hours_worked * c.hourly_rate) as total_revenue,
                         SUM(pa.hours_worked) as total_hours
                       FROM project_assignments pa
                       JOIN consultants c ON pa.consultant_id = c.id
                       WHERE pa.consultant_id = :consultant_id
                         AND pa.created_at BETWEEN :start_date AND :end_date";
        
        $revenueResult = $this->query($revenueSQL, [
            'consultant_id' => $consultantId,
            'start_date' => $startDate,
            'end_date' => $endDate
        ]);
        $performance['revenue'] = $revenueResult[0];
        
        // Client satisfaction
        $reviewSQL = "SELECT 
                        AVG(rating) as avg_rating,
                        COUNT(*) as total_reviews
                      FROM consultant_reviews
                      WHERE consultant_id = :consultant_id
                        AND created_at BETWEEN :start_date AND :end_date";
        
        $reviewResult = $this->query($reviewSQL, [
            'consultant_id' => $consultantId,
            'start_date' => $startDate,
            'end_date' => $endDate
        ]);
        $performance['reviews'] = $reviewResult[0];
        
        return $performance;
    }

    public function assignProject(int $consultantId, int $projectId, array $data): array
    {
        $sql = "INSERT INTO project_assignments (
                    consultant_id, project_id, role, start_date, end_date, 
                    hourly_rate, status, created_at
                ) VALUES (
                    :consultant_id, :project_id, :role, :start_date, :end_date,
                    :hourly_rate, :status, NOW()
                )";
        
        $params = [
            'consultant_id' => $consultantId,
            'project_id' => $projectId,
            'role' => $data['role'] ?? 'Consultant',
            'start_date' => $data['start_date'] ?? date('Y-m-d'),
            'end_date' => $data['end_date'] ?? null,
            'hourly_rate' => $data['hourly_rate'] ?? null,
            'status' => $data['status'] ?? 'active'
        ];
        
        $assignmentId = $this->insert($sql, $params);
        
        // Get the assignment details
        $assignmentSQL = "SELECT pa.*, p.name as project_name, c.name as consultant_name
                         FROM project_assignments pa
                         JOIN projects p ON pa.project_id = p.id
                         JOIN consultants c ON pa.consultant_id = c.id
                         WHERE pa.id = :id";
        
        $result = $this->query($assignmentSQL, ['id' => $assignmentId]);
        return $result[0];
    }

    public function updateAvailability(int $consultantId, array $availability): array
    {
        // Delete existing availability
        $this->execute("DELETE FROM consultant_availability WHERE consultant_id = :id", ['id' => $consultantId]);
        
        // Insert new availability
        foreach ($availability as $schedule) {
            $sql = "INSERT INTO consultant_availability (
                        consultant_id, day_of_week, start_time, end_time, is_available
                    ) VALUES (
                        :consultant_id, :day_of_week, :start_time, :end_time, :is_available
                    )";
            
            $this->execute($sql, [
                'consultant_id' => $consultantId,
                'day_of_week' => $schedule['day_of_week'],
                'start_time' => $schedule['start_time'] ?? null,
                'end_time' => $schedule['end_time'] ?? null,
                'is_available' => $schedule['is_available'] ? 1 : 0
            ]);
        }
        
        // Return updated availability
        $availabilitySQL = "SELECT * FROM consultant_availability WHERE consultant_id = :id ORDER BY day_of_week";
        return $this->query($availabilitySQL, ['id' => $consultantId]);
    }

    private function updateConsultantSkills(int $consultantId, array $skills): void
    {
        // Delete existing skills
        $this->execute("DELETE FROM consultant_skills WHERE consultant_id = :id", ['id' => $consultantId]);
        
        // Insert new skills
        foreach ($skills as $skillData) {
            $skillId = $skillData['skill_id'] ?? null;
            $skillName = $skillData['name'] ?? null;
            
            // If skill_id not provided, try to find or create skill by name
            if (!$skillId && $skillName) {
                $existingSkill = $this->query("SELECT id FROM skills WHERE name = :name", ['name' => $skillName]);
                if (!empty($existingSkill)) {
                    $skillId = $existingSkill[0]['id'];
                } else {
                    // Create new skill
                    $skillId = $this->insert("INSERT INTO skills (name, created_at) VALUES (:name, NOW())", ['name' => $skillName]);
                }
            }
            
            if ($skillId) {
                $sql = "INSERT INTO consultant_skills (consultant_id, skill_id, proficiency_level) 
                        VALUES (:consultant_id, :skill_id, :proficiency_level)";
                
                $this->execute($sql, [
                    'consultant_id' => $consultantId,
                    'skill_id' => $skillId,
                    'proficiency_level' => $skillData['proficiency_level'] ?? 'intermediate'
                ]);
            }
        }
    }

    private function updateConsultantAvailability(int $consultantId, array $availability): void
    {
        // Delete existing availability
        $this->execute("DELETE FROM consultant_availability WHERE consultant_id = :id", ['id' => $consultantId]);
        
        // Insert new availability
        foreach ($availability as $schedule) {
            $sql = "INSERT INTO consultant_availability (
                        consultant_id, day_of_week, start_time, end_time, is_available
                    ) VALUES (
                        :consultant_id, :day_of_week, :start_time, :end_time, :is_available
                    )";
            
            $this->execute($sql, [
                'consultant_id' => $consultantId,
                'day_of_week' => $schedule['day_of_week'],
                'start_time' => $schedule['start_time'] ?? null,
                'end_time' => $schedule['end_time'] ?? null,
                'is_available' => $schedule['is_available'] ? 1 : 0
            ]);
        }
    }
}
