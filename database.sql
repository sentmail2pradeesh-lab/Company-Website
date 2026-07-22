-- ASZEN Technologies Database Schema
-- Run: mysql -u root -p < database.sql

CREATE DATABASE IF NOT EXISTS aszen_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE aszen_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  reset_token VARCHAR(255) NULL,
  reset_token_expiry DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS blogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NULL,
  image_url VARCHAR(500) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Sample admin user (password: admin123)
INSERT INTO users (email, password_hash)
VALUES (
  'admin@aszen.com',
  'pbkdf2:sha256:600000$placeholder$replace_via_app_register'
)
ON DUPLICATE KEY UPDATE email = email;

-- Sample blogs
INSERT INTO blogs (title, excerpt, image_url) VALUES
(
  'The Future of AI in Photo Editing',
  'Discover how artificial intelligence is revolutionizing the way we edit and enhance images.',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80'
),
(
  'Video Editing Trends for 2025',
  'Stay ahead with the latest techniques and tools shaping professional video production.',
  'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&q=80'
),
(
  'Real Estate Photography Tips',
  'Learn how to capture stunning property photos that sell faster and at better prices.',
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80'
);
