-- Migration 003: event_log
-- Stores system events: LOGIN, LOGOUT, FAILED_LOGIN.
-- admin_id is nullable to support FAILED_LOGIN where admin may not exist.
-- Named event_log (underscore) to distinguish from legacy CodeIgniter 'eventlog' table.

CREATE TABLE IF NOT EXISTS `event_log` (
  `id`          INT AUTO_INCREMENT PRIMARY KEY,
  `admin_id`    INT DEFAULT NULL,
  `event_type`  VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `ip_address`  VARCHAR(50) DEFAULT NULL,
  `timestamp`   DATETIME DEFAULT NOW(),
  FOREIGN KEY (`admin_id`) REFERENCES `admin`(`id`) ON DELETE SET NULL,
  INDEX idx_el_event_type (`event_type`),
  INDEX idx_el_admin_id   (`admin_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
