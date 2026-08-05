-- Migration 001: refresh_tokens
-- Stores SHA-256 hashed JWT refresh tokens for each admin session.
-- admin.id is INT (int(3)) in legacy schema — FK must match.

CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id`         INT AUTO_INCREMENT PRIMARY KEY,
  `admin_id`   INT NOT NULL,
  `token_hash` VARCHAR(255) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `created_at` DATETIME DEFAULT NOW(),
  `revoked`    TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`admin_id`) REFERENCES `admin`(`id`) ON DELETE CASCADE,
  INDEX idx_rt_token_hash (`token_hash`),
  INDEX idx_rt_admin_id   (`admin_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
