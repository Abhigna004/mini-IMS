-- Migration 002: audit_log
-- Tracks CREATE/UPDATE/DELETE on items, transactions, admin.
-- old_values / new_values stored as JSON (requires MySQL 5.7.8+ / MySQL 8).

CREATE TABLE IF NOT EXISTS `audit_log` (
  `id`         INT AUTO_INCREMENT PRIMARY KEY,
  `admin_id`   INT NOT NULL,
  `action`     ENUM('CREATE','UPDATE','DELETE') NOT NULL,
  `entity`     VARCHAR(100) NOT NULL,
  `entity_id`  BIGINT UNSIGNED NOT NULL,
  `old_values` JSON DEFAULT NULL,
  `new_values` JSON DEFAULT NULL,
  `timestamp`  DATETIME DEFAULT NOW(),
  FOREIGN KEY (`admin_id`) REFERENCES `admin`(`id`) ON DELETE CASCADE,
  INDEX idx_al_entity   (`entity`, `entity_id`),
  INDEX idx_al_admin_id (`admin_id`),
  INDEX idx_al_action   (`action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
