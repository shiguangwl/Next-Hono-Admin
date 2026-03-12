CREATE TABLE `sys_admin_session` (
  `id` bigint unsigned AUTO_INCREMENT NOT NULL,
  `admin_id` bigint unsigned NOT NULL,
  `token_hash` varchar(64) NOT NULL,
  `user_agent` varchar(255),
  `login_ip` varchar(50),
  `expires_at` datetime NOT NULL,
  `revoked_at` datetime,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `sys_admin_session_id` PRIMARY KEY(`id`),
  CONSTRAINT `uk_admin_session_token_hash` UNIQUE(`token_hash`)
);
--> statement-breakpoint
CREATE INDEX `idx_admin_session_admin_id` ON `sys_admin_session` (`admin_id`);
--> statement-breakpoint
CREATE INDEX `idx_admin_session_expires_at` ON `sys_admin_session` (`expires_at`);
--> statement-breakpoint
CREATE INDEX `idx_admin_session_revoked_at` ON `sys_admin_session` (`revoked_at`);
