-- Additional tables needed for IBMS v2.0

-- User management table
CREATE TABLE IF NOT EXISTS `user_table` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `role` enum('admin','manager','user') DEFAULT 'user',
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Refresh tokens table
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_hash` (`token_hash`),
  KEY `user_id` (`user_id`),
  KEY `expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Token blacklist table
CREATE TABLE IF NOT EXISTS `token_blacklist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `token_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_hash` (`token_hash`),
  KEY `expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (password: admin123)
INSERT INTO `user_table` (`username`, `email`, `password`, `first_name`, `last_name`, `role`, `status`) 
VALUES ('admin', 'admin@easy2work.com', MD5('admin123'), 'System', 'Administrator', 'admin', 'active')
ON DUPLICATE KEY UPDATE `password` = MD5('admin123');

-- Update existing tables with missing columns if needed

-- Add missing columns to order_table if they don't exist
ALTER TABLE `order_table` 
ADD COLUMN IF NOT EXISTS `DeliveryDate` date DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `Remarks` text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `PaymentStatus` enum('unpaid','partial','paid') DEFAULT 'unpaid',
ADD COLUMN IF NOT EXISTS `OrderType` varchar(50) DEFAULT 'standard';

-- Add missing columns to client_table if they don't exist  
ALTER TABLE `client_table`
ADD COLUMN IF NOT EXISTS `DOB` date DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `Title` varchar(20) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `ClientContactPerson` varchar(100) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `Attended` tinyint(1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS `AttendedDateTime` datetime DEFAULT NULL;

-- Create rate_table if it doesn't exist
CREATE TABLE IF NOT EXISTS `rate_table` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `EntryDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `EntryUser` varchar(50) DEFAULT NULL,
  `AdMedium` varchar(50) NOT NULL,
  `AdType` varchar(50) NOT NULL,
  `AdCategory` varchar(50) NOT NULL,
  `Rate` decimal(10,2) NOT NULL,
  `Unit` varchar(20) DEFAULT 'Per Unit',
  `GST` decimal(5,2) DEFAULT 18.00,
  `ValidFrom` date DEFAULT NULL,
  `ValidTill` date DEFAULT NULL,
  `ValidityStatus` tinyint(1) DEFAULT 1,
  `Scheme` varchar(50) DEFAULT 'Standard',
  `MinQuantity` int(11) DEFAULT 1,
  `MaxQuantity` int(11) DEFAULT 999999,
  `DiscountPercentage` decimal(5,2) DEFAULT 0.00,
  PRIMARY KEY (`ID`),
  KEY `idx_medium_type_category` (`AdMedium`, `AdType`, `AdCategory`),
  KEY `idx_validity` (`ValidityStatus`, `ValidFrom`, `ValidTill`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert some sample rates
INSERT INTO `rate_table` (`AdMedium`, `AdType`, `AdCategory`, `Rate`, `Unit`, `GST`, `ValidFrom`) VALUES
('Newspaper', 'Classified', 'Personal', 10.00, 'Per Line', 18.00, CURDATE()),
('Newspaper', 'Classified', 'Business', 15.00, 'Per Line', 18.00, CURDATE()),
('Newspaper', 'Display', 'Full Page', 50000.00, 'Per Page', 18.00, CURDATE()),
('Newspaper', 'Display', 'Half Page', 25000.00, 'Per Page', 18.00, CURDATE()),
('Radio', 'Spot', '30 Sec', 500.00, 'Per Spot', 18.00, CURDATE()),
('Radio', 'Spot', '60 Sec', 800.00, 'Per Spot', 18.00, CURDATE()),
('TV', 'Spot', '30 Sec', 2000.00, 'Per Spot', 18.00, CURDATE()),
('TV', 'Spot', '60 Sec', 3500.00, 'Per Spot', 18.00, CURDATE()),
('Digital', 'Banner', 'Standard', 100.00, 'Per Day', 18.00, CURDATE()),
('Digital', 'Video', '30 Sec', 300.00, 'Per Day', 18.00, CURDATE())
ON DUPLICATE KEY UPDATE `Rate` = VALUES(`Rate`);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS `idx_client_validity` ON `client_table` (`Validity`);
CREATE INDEX IF NOT EXISTS `idx_client_entry_date` ON `client_table` (`EntryDateTime`);
CREATE INDEX IF NOT EXISTS `idx_order_status` ON `order_table` (`Status`);
CREATE INDEX IF NOT EXISTS `idx_order_payment_status` ON `order_table` (`PaymentStatus`);
CREATE INDEX IF NOT EXISTS `idx_order_entry_date` ON `order_table` (`EntryDate`);
CREATE INDEX IF NOT EXISTS `idx_bill_validity` ON `bill_table` (`ValidityStatus`);
CREATE INDEX IF NOT EXISTS `idx_bill_date` ON `bill_table` (`BillDate`);
CREATE INDEX IF NOT EXISTS `idx_cart_validity` ON `cart_table` (`Valid Status`);
