<?php

namespace App\Services;

use App\Database\DatabaseManager;
use PDO;

class EmployeeService
{
    public function getEmployees(string $tenant, array $filters = []): array
    {
        $db = DatabaseManager::getConnection($tenant);
        
        $sql = "
            SELECT 
                e.*,
                d.department_name,
                COUNT(DISTINCT p.id) as active_projects,
                AVG(pr.rating) as avg_rating
            FROM employee_table e
            LEFT JOIN department_table d ON e.department_id = d.id
            LEFT JOIN project_assignments pa ON e.id = pa.employee_id
            LEFT JOIN project_table p ON pa.project_id = p.id AND p.status = 'active'
            LEFT JOIN performance_reviews pr ON e.id = pr.employee_id
            WHERE e.status != 'deleted'
        ";
        
        $params = [];
        
        // Apply filters
        if (!empty($filters['department'])) {
            $sql .= " AND e.department_id = :department";
            $params[':department'] = $filters['department'];
        }
        
        if (!empty($filters['status'])) {
            $sql .= " AND e.status = :status";
            $params[':status'] = $filters['status'];
        }
        
        if (!empty($filters['role'])) {
            $sql .= " AND e.role = :role";
            $params[':role'] = $filters['role'];
        }
        
        if (!empty($filters['search'])) {
            $sql .= " AND (e.first_name LIKE :search OR e.last_name LIKE :search OR e.email LIKE :search)";
            $params[':search'] = '%' . $filters['search'] . '%';
        }
        
        $sql .= " GROUP BY e.id ORDER BY e.created_at DESC";
        
        // Add pagination
        $limit = isset($filters['limit']) ? (int)$filters['limit'] : 20;
        $offset = isset($filters['offset']) ? (int)$filters['offset'] : 0;
        $sql .= " LIMIT :limit OFFSET :offset";
        
        $stmt = $db->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $employees = $stmt->fetchAll();
        
        return array_map([$this, 'formatEmployee'], $employees);
    }

    public function getEmployee(string $tenant, string $employeeId): ?array
    {
        $db = DatabaseManager::getConnection($tenant);
        
        $sql = "
            SELECT 
                e.*,
                d.department_name,
                COUNT(DISTINCT p.id) as active_projects,
                AVG(pr.rating) as avg_rating,
                SUM(t.hours) as total_hours_this_month
            FROM employee_table e
            LEFT JOIN department_table d ON e.department_id = d.id
            LEFT JOIN project_assignments pa ON e.id = pa.employee_id
            LEFT JOIN project_table p ON pa.project_id = p.id AND p.status = 'active'
            LEFT JOIN performance_reviews pr ON e.id = pr.employee_id
            LEFT JOIN timesheet_table t ON e.id = t.employee_id AND MONTH(t.date) = MONTH(NOW()) AND YEAR(t.date) = YEAR(NOW())
            WHERE e.id = :employeeId AND e.status != 'deleted'
            GROUP BY e.id
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->bindValue(':employeeId', $employeeId);
        $stmt->execute();
        
        $employee = $stmt->fetch();
        
        if (!$employee) {
            return null;
        }
        
        return $this->formatEmployee($employee);
    }

    public function createEmployee(string $tenant, array $data): string
    {
        $db = DatabaseManager::getConnection($tenant);
        
        $employeeId = 'EMP-' . date('Y') . '-' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
        
        $sql = "
            INSERT INTO employee_table (
                id,
                employee_id,
                first_name,
                last_name,
                email,
                phone,
                department_id,
                role,
                position,
                salary,
                hire_date,
                status,
                address,
                emergency_contact,
                skills,
                created_at,
                created_by
            ) VALUES (
                :id,
                :employee_id,
                :first_name,
                :last_name,
                :email,
                :phone,
                :department_id,
                :role,
                :position,
                :salary,
                :hire_date,
                :status,
                :address,
                :emergency_contact,
                :skills,
                NOW(),
                :created_by
            )
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':id' => uniqid(),
            ':employee_id' => $employeeId,
            ':first_name' => $data['firstName'],
            ':last_name' => $data['lastName'],
            ':email' => $data['email'],
            ':phone' => $data['phone'] ?? null,
            ':department_id' => $data['departmentId'] ?? null,
            ':role' => $data['role'] ?? 'employee',
            ':position' => $data['position'] ?? null,
            ':salary' => $data['salary'] ?? null,
            ':hire_date' => $data['hireDate'] ?? date('Y-m-d'),
            ':status' => $data['status'] ?? 'active',
            ':address' => isset($data['address']) ? json_encode($data['address']) : null,
            ':emergency_contact' => isset($data['emergencyContact']) ? json_encode($data['emergencyContact']) : null,
            ':skills' => isset($data['skills']) ? json_encode($data['skills']) : null,
            ':created_by' => $data['createdBy'] ?? 'System'
        ]);
        
        return $employeeId;
    }

    public function updateEmployee(string $tenant, string $employeeId, array $data): bool
    {
        $db = DatabaseManager::getConnection($tenant);
        
        $sql = "
            UPDATE employee_table SET
                first_name = :first_name,
                last_name = :last_name,
                email = :email,
                phone = :phone,
                department_id = :department_id,
                role = :role,
                position = :position,
                salary = :salary,
                status = :status,
                address = :address,
                emergency_contact = :emergency_contact,
                skills = :skills,
                updated_at = NOW(),
                updated_by = :updated_by
            WHERE id = :employee_id OR employee_id = :employee_id
        ";
        
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([
            ':employee_id' => $employeeId,
            ':first_name' => $data['firstName'],
            ':last_name' => $data['lastName'],
            ':email' => $data['email'],
            ':phone' => $data['phone'] ?? null,
            ':department_id' => $data['departmentId'] ?? null,
            ':role' => $data['role'] ?? 'employee',
            ':position' => $data['position'] ?? null,
            ':salary' => $data['salary'] ?? null,
            ':status' => $data['status'] ?? 'active',
            ':address' => isset($data['address']) ? json_encode($data['address']) : null,
            ':emergency_contact' => isset($data['emergencyContact']) ? json_encode($data['emergencyContact']) : null,
            ':skills' => isset($data['skills']) ? json_encode($data['skills']) : null,
            ':updated_by' => $data['updatedBy'] ?? 'System'
        ]);
        
        return $result && $stmt->rowCount() > 0;
    }

    public function deleteEmployee(string $tenant, string $employeeId): bool
    {
        $db = DatabaseManager::getConnection($tenant);
        
        // Soft delete - set status to deleted
        $sql = "
            UPDATE employee_table SET
                status = 'deleted',
                updated_at = NOW(),
                updated_by = 'System'
            WHERE id = :employee_id OR employee_id = :employee_id
        ";
        
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([':employee_id' => $employeeId]);
        
        return $result && $stmt->rowCount() > 0;
    }

    public function getEmployeeStats(string $tenant): array
    {
        $db = DatabaseManager::getConnection($tenant);
        
        // Total employees
        $totalSql = "SELECT COUNT(*) as total FROM employee_table WHERE status != 'deleted'";
        $totalStmt = $db->prepare($totalSql);
        $totalStmt->execute();
        $total = $totalStmt->fetch()['total'];
        
        // Active employees
        $activeSql = "SELECT COUNT(*) as active FROM employee_table WHERE status = 'active'";
        $activeStmt = $db->prepare($activeSql);
        $activeStmt->execute();
        $active = $activeStmt->fetch()['active'];
        
        // Department breakdown
        $departmentSql = "
            SELECT 
                d.department_name,
                COUNT(e.id) as count
            FROM employee_table e
            LEFT JOIN department_table d ON e.department_id = d.id
            WHERE e.status != 'deleted'
            GROUP BY d.department_name
        ";
        $departmentStmt = $db->prepare($departmentSql);
        $departmentStmt->execute();
        $departments = $departmentStmt->fetchAll();
        
        // Recent hires (last 30 days)
        $recentHiresSql = "
            SELECT COUNT(*) as recent_hires 
            FROM employee_table 
            WHERE status != 'deleted' 
            AND hire_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        ";
        $recentHiresStmt = $db->prepare($recentHiresSql);
        $recentHiresStmt->execute();
        $recentHires = $recentHiresStmt->fetch()['recent_hires'];
        
        // Average performance rating
        $avgRatingSql = "
            SELECT AVG(rating) as avg_rating 
            FROM performance_reviews pr
            JOIN employee_table e ON pr.employee_id = e.id
            WHERE e.status != 'deleted'
            AND pr.review_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        ";
        $avgRatingStmt = $db->prepare($avgRatingSql);
        $avgRatingStmt->execute();
        $avgRating = $avgRatingStmt->fetch()['avg_rating'] ?? 0;
        
        return [
            'total' => (int)$total,
            'active' => (int)$active,
            'inactive' => $total - $active,
            'recentHires' => (int)$recentHires,
            'avgRating' => round((float)$avgRating, 2),
            'departments' => $departments
        ];
    }

    public function getEmployeePerformance(string $tenant, string $employeeId, array $params = []): array
    {
        $db = DatabaseManager::getConnection($tenant);
        
        $period = $params['period'] ?? '12';
        
        // Performance reviews
        $reviewsSql = "
            SELECT 
                rating,
                review_date,
                goals_met,
                feedback,
                reviewer_name
            FROM performance_reviews
            WHERE employee_id = :employee_id
            AND review_date >= DATE_SUB(NOW(), INTERVAL :period MONTH)
            ORDER BY review_date DESC
        ";
        $reviewsStmt = $db->prepare($reviewsSql);
        $reviewsStmt->bindValue(':employee_id', $employeeId);
        $reviewsStmt->bindValue(':period', $period, PDO::PARAM_INT);
        $reviewsStmt->execute();
        $reviews = $reviewsStmt->fetchAll();
        
        // Project assignments and completion
        $projectsSql = "
            SELECT 
                p.project_name,
                p.status,
                pa.role as project_role,
                pa.assigned_date,
                pa.completion_date,
                p.priority
            FROM project_assignments pa
            JOIN project_table p ON pa.project_id = p.id
            WHERE pa.employee_id = :employee_id
            AND pa.assigned_date >= DATE_SUB(NOW(), INTERVAL :period MONTH)
            ORDER BY pa.assigned_date DESC
        ";
        $projectsStmt = $db->prepare($projectsSql);
        $projectsStmt->bindValue(':employee_id', $employeeId);
        $projectsStmt->bindValue(':period', $period, PDO::PARAM_INT);
        $projectsStmt->execute();
        $projects = $projectsStmt->fetchAll();
        
        // Timesheet data
        $timesheetSql = "
            SELECT 
                DATE(date) as work_date,
                SUM(hours) as total_hours,
                project_id,
                task_description
            FROM timesheet_table
            WHERE employee_id = :employee_id
            AND date >= DATE_SUB(NOW(), INTERVAL :period MONTH)
            GROUP BY DATE(date)
            ORDER BY work_date DESC
        ";
        $timesheetStmt = $db->prepare($timesheetSql);
        $timesheetStmt->bindValue(':employee_id', $employeeId);
        $timesheetStmt->bindValue(':period', $period, PDO::PARAM_INT);
        $timesheetStmt->execute();
        $timesheet = $timesheetStmt->fetchAll();
        
        return [
            'reviews' => $reviews,
            'projects' => $projects,
            'timesheet' => $timesheet,
            'summary' => [
                'avgRating' => !empty($reviews) ? array_sum(array_column($reviews, 'rating')) / count($reviews) : 0,
                'totalProjects' => count($projects),
                'completedProjects' => count(array_filter($projects, fn($p) => $p['status'] === 'completed')),
                'totalHours' => array_sum(array_column($timesheet, 'total_hours'))
            ]
        ];
    }

    private function formatEmployee(array $employee): array
    {
        return [
            'id' => $employee['id'],
            'employeeId' => $employee['employee_id'],
            'firstName' => $employee['first_name'],
            'lastName' => $employee['last_name'],
            'fullName' => $employee['first_name'] . ' ' . $employee['last_name'],
            'email' => $employee['email'],
            'phone' => $employee['phone'],
            'department' => $employee['department_name'] ?? 'Unassigned',
            'departmentId' => $employee['department_id'],
            'role' => $employee['role'],
            'position' => $employee['position'],
            'salary' => $employee['salary'] ? (float)$employee['salary'] : null,
            'hireDate' => $employee['hire_date'],
            'status' => $employee['status'],
            'address' => $employee['address'] ? json_decode($employee['address'], true) : null,
            'emergencyContact' => $employee['emergency_contact'] ? json_decode($employee['emergency_contact'], true) : null,
            'skills' => $employee['skills'] ? json_decode($employee['skills'], true) : [],
            'activeProjects' => (int)($employee['active_projects'] ?? 0),
            'avgRating' => $employee['avg_rating'] ? round((float)$employee['avg_rating'], 2) : null,
            'totalHoursThisMonth' => (float)($employee['total_hours_this_month'] ?? 0),
            'createdAt' => $employee['created_at'],
            'updatedAt' => $employee['updated_at'] ?? null
        ];
    }
}
