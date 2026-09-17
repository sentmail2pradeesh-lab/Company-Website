-- ====================================================================
-- ASZEN Platform - Complete MySQL / MariaDB Database Schema
-- Optimized for Hostinger phpMyAdmin Import
-- ====================================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `production_sheets`;
DROP TABLE IF EXISTS `job_stages`;
DROP TABLE IF EXISTS `jobs`;
DROP TABLE IF EXISTS `work_sessions`;
DROP TABLE IF EXISTS `clients`;
DROP TABLE IF EXISTS `blogs`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------------------
-- 1. USERS TABLE
-- --------------------------------------------------------------------
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `name` VARCHAR(255) DEFAULT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'employee',
  `designation` VARCHAR(100) NOT NULL DEFAULT 'Editor',
  `password_hash` VARCHAR(255) NOT NULL,
  `reset_token` VARCHAR(255) DEFAULT NULL,
  `reset_token_expiry` DATETIME DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Master Admin Account (arun@aszen.com / Password: Aszen@123)
INSERT INTO `users` (`id`, `email`, `name`, `role`, `designation`, `password_hash`)
VALUES (
  1,
  'arun@aszen.com',
  'Arun',
  'admin',
  'Admin / System Manager',
  'scrypt:32768:8:1$u7h0Pj6BvW5E2Y1x$7f5a9b8c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a'
);

-- --------------------------------------------------------------------
-- 2. CLIENTS TABLE
-- --------------------------------------------------------------------
CREATE TABLE `clients` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `contact` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_clients_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 3. JOBS TABLE
-- --------------------------------------------------------------------
CREATE TABLE `jobs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `job_number` VARCHAR(50) NOT NULL UNIQUE,
  `client_code` VARCHAR(50) NOT NULL,
  `service` VARCHAR(255) NOT NULL,
  `files_count` INT DEFAULT 0,
  `output_target` INT DEFAULT 0,
  `status` VARCHAR(50) DEFAULT 'In Progress',
  `client_entry_time` VARCHAR(50) DEFAULT NULL,
  `client_target_time` VARCHAR(50) DEFAULT NULL,
  `client_finish_time` VARCHAR(50) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_jobs_number` (`job_number`),
  INDEX `idx_jobs_client` (`client_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 4. JOB STAGES TABLE
-- --------------------------------------------------------------------
CREATE TABLE `job_stages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `job_id` INT NOT NULL,
  `stage_key` VARCHAR(50) NOT NULL,
  `assignee` VARCHAR(255) DEFAULT '',
  `status` VARCHAR(50) DEFAULT 'Unassigned',
  `files_count` INT DEFAULT 0,
  `output_count` INT DEFAULT 0,
  `start_time` VARCHAR(50) DEFAULT NULL,
  `end_time` VARCHAR(50) DEFAULT NULL,
  `paused_duration_seconds` INT DEFAULT 0,
  `current_pause_start` VARCHAR(50) DEFAULT NULL,
  `pause_logs_json` TEXT DEFAULT NULL,
  FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 5. PRODUCTION SHEETS TABLE
-- --------------------------------------------------------------------
CREATE TABLE `production_sheets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `date` VARCHAR(10) NOT NULL,
  `editor_name` VARCHAR(255) NOT NULL,
  `role` VARCHAR(100) NOT NULL,
  `job_id` VARCHAR(50) NOT NULL,
  `client` VARCHAR(50) NOT NULL,
  `stage` VARCHAR(50) NOT NULL,
  `files_processed` INT DEFAULT 0,
  `active_minutes` INT DEFAULT 0,
  `pause_minutes` INT DEFAULT 0,
  `status` VARCHAR(50) DEFAULT 'Verified',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_prod_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 6. WORK SESSIONS TABLE (Employee Attendance Logs)
-- --------------------------------------------------------------------
CREATE TABLE `work_sessions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `user_email` VARCHAR(255) NOT NULL,
  `user_name` VARCHAR(255) NOT NULL,
  `user_role` VARCHAR(50) NOT NULL DEFAULT 'employee',
  `date` VARCHAR(10) NOT NULL,
  `login_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `logout_time` DATETIME DEFAULT NULL,
  `total_hours` FLOAT DEFAULT 0.0,
  `status` VARCHAR(50) DEFAULT 'Active',
  `notes` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_work_sessions_email` (`user_email`),
  INDEX `idx_work_sessions_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 7. AUDIT LOGS TABLE
-- --------------------------------------------------------------------
CREATE TABLE `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_email` VARCHAR(255) NOT NULL,
  `user_name` VARCHAR(255) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `details` TEXT DEFAULT NULL,
  `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 8. BLOGS TABLE
-- --------------------------------------------------------------------
CREATE TABLE `blogs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `excerpt` TEXT NOT NULL,
  `content` TEXT DEFAULT NULL,
  `image_url` VARCHAR(500) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `blogs` (`title`, `excerpt`, `image_url`) VALUES
('The Future of AI in Photo Editing', 'Discover how artificial intelligence is revolutionizing the way we edit and enhance images.', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80'),
('Video Editing Trends for 2025', 'Stay ahead with the latest techniques and tools shaping professional video production.', 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&q=80'),
('Real Estate Photography Tips', 'Learn how to capture stunning property photos that sell faster and at better prices.', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80');
