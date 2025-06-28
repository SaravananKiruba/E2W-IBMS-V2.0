-- Security and Compliance Tables Migration
-- Add these tables to each tenant database

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `resource` varchar(100) NOT NULL,
  `details` text,
  `ip_address` varchar(45),
  `user_agent` text,
  `severity` enum('low','medium','high','critical') DEFAULT 'medium',
  `status` enum('success','failed','warning') DEFAULT 'success',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_severity` (`severity`),
  KEY `idx_created_at` (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `user_table`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Security Alerts Table
CREATE TABLE IF NOT EXISTS `security_alerts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` enum('login_failure','data_access','permission_change','system_error','brute_force','data_breach') NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `severity` enum('low','medium','high','critical') DEFAULT 'medium',
  `status` enum('open','investigating','resolved','false_positive') DEFAULT 'open',
  `user_id` int(11) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `resolution_notes` text DEFAULT NULL,
  `resolved_by` int(11) DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`),
  KEY `idx_severity` (`severity`),
  KEY `idx_status` (`status`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `user_table`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`resolved_by`) REFERENCES `user_table`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Compliance Reports Table
CREATE TABLE IF NOT EXISTS `compliance_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` enum('gdpr','data_retention','access_control','audit_trail','iso27001','sox') NOT NULL,
  `status` enum('compliant','non_compliant','needs_attention','in_progress') DEFAULT 'in_progress',
  `score` decimal(5,2) DEFAULT NULL,
  `issues_found` int(11) DEFAULT 0,
  `report_data` json DEFAULT NULL,
  `recommendations` json DEFAULT NULL,
  `last_check` timestamp NULL DEFAULT NULL,
  `next_check` timestamp NULL DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`),
  KEY `idx_last_check` (`last_check`),
  FOREIGN KEY (`created_by`) REFERENCES `user_table`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Security Settings Table
CREATE TABLE IF NOT EXISTS `security_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text,
  `setting_type` enum('string','integer','boolean','json') DEFAULT 'string',
  `category` varchar(50) DEFAULT 'general',
  `description` text,
  `is_encrypted` tinyint(1) DEFAULT 0,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_setting_key` (`setting_key`),
  KEY `idx_category` (`category`),
  FOREIGN KEY (`updated_by`) REFERENCES `user_table`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data Access Logs Table (for detailed data access tracking)
CREATE TABLE IF NOT EXISTS `data_access_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `table_name` varchar(100) NOT NULL,
  `record_id` int(11) DEFAULT NULL,
  `operation` enum('SELECT','INSERT','UPDATE','DELETE','EXPORT') NOT NULL,
  `columns_accessed` json DEFAULT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `ip_address` varchar(45),
  `session_id` varchar(255),
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_table_name` (`table_name`),
  KEY `idx_operation` (`operation`),
  KEY `idx_created_at` (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `user_table`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Security Incidents Table
CREATE TABLE IF NOT EXISTS `security_incidents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `incident_number` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `severity` enum('low','medium','high','critical') DEFAULT 'medium',
  `status` enum('reported','investigating','contained','resolved','closed') DEFAULT 'reported',
  `category` enum('data_breach','unauthorized_access','malware','phishing','dos','other') NOT NULL,
  `affected_systems` json DEFAULT NULL,
  `affected_users` json DEFAULT NULL,
  `impact_assessment` text,
  `containment_actions` text,
  `root_cause` text,
  `lessons_learned` text,
  `reported_by` int(11) DEFAULT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `reported_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_incident_number` (`incident_number`),
  KEY `idx_severity` (`severity`),
  KEY `idx_status` (`status`),
  KEY `idx_category` (`category`),
  KEY `idx_reported_at` (`reported_at`),
  FOREIGN KEY (`reported_by`) REFERENCES `user_table`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`assigned_to`) REFERENCES `user_table`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Security Policies Table
CREATE TABLE IF NOT EXISTS `security_policies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `policy_name` varchar(255) NOT NULL,
  `policy_type` enum('password','access_control','data_retention','encryption','backup') NOT NULL,
  `policy_rules` json NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `effective_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_policy_type` (`policy_type`),
  KEY `idx_is_active` (`is_active`),
  FOREIGN KEY (`created_by`) REFERENCES `user_table`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`approved_by`) REFERENCES `user_table`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Default Security Settings
INSERT INTO `security_settings` (`setting_key`, `setting_value`, `setting_type`, `category`, `description`) VALUES
('password_min_length', '8', 'integer', 'password_policy', 'Minimum password length'),
('password_require_uppercase', '1', 'boolean', 'password_policy', 'Require uppercase letters in password'),
('password_require_lowercase', '1', 'boolean', 'password_policy', 'Require lowercase letters in password'),
('password_require_numbers', '1', 'boolean', 'password_policy', 'Require numbers in password'),
('password_require_special', '1', 'boolean', 'password_policy', 'Require special characters in password'),
('session_timeout', '30', 'integer', 'access_control', 'Session timeout in minutes'),
('max_failed_login_attempts', '5', 'integer', 'access_control', 'Maximum failed login attempts before lockout'),
('account_lockout_duration', '15', 'integer', 'access_control', 'Account lockout duration in minutes'),
('enable_two_factor_auth', '0', 'boolean', 'access_control', 'Enable two-factor authentication'),
('data_retention_period', '2555', 'integer', 'data_retention', 'Data retention period in days (7 years)'),
('enable_audit_logging', '1', 'boolean', 'audit', 'Enable comprehensive audit logging'),
('log_data_access', '1', 'boolean', 'audit', 'Log detailed data access'),
('encryption_algorithm', 'AES-256', 'string', 'encryption', 'Default encryption algorithm'),
('backup_encryption', '1', 'boolean', 'encryption', 'Encrypt database backups');

-- Insert Default Security Policies
INSERT INTO `security_policies` (`policy_name`, `policy_type`, `policy_rules`, `effective_date`) VALUES
('Default Password Policy', 'password', '{"min_length": 8, "require_uppercase": true, "require_lowercase": true, "require_numbers": true, "require_special": true, "history_count": 5, "max_age_days": 90}', CURDATE()),
('Default Access Control Policy', 'access_control', '{"session_timeout": 30, "max_failed_attempts": 5, "lockout_duration": 15, "require_mfa": false, "ip_restrictions": []}', CURDATE()),
('Default Data Retention Policy', 'data_retention', '{"client_data": 2555, "transaction_data": 2555, "audit_logs": 2555, "user_sessions": 30}', CURDATE());

-- Create indexes for better performance
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action);
CREATE INDEX idx_audit_logs_date_severity ON audit_logs(created_at, severity);
CREATE INDEX idx_security_alerts_type_status ON security_alerts(type, status);
CREATE INDEX idx_data_access_logs_user_table ON data_access_logs(user_id, table_name);
CREATE INDEX idx_data_access_logs_date_operation ON data_access_logs(created_at, operation);
