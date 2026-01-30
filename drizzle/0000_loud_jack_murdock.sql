CREATE TABLE `sys_admin` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`username` varchar(50) NOT NULL,
	`password` varchar(255) NOT NULL,
	`nickname` varchar(50) NOT NULL DEFAULT '',
	`status` tinyint unsigned NOT NULL DEFAULT 1,
	`login_ip` varchar(50),
	`login_time` datetime,
	`remark` varchar(500),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sys_admin_id` PRIMARY KEY(`id`),
	CONSTRAINT `uk_username` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `sys_admin_role` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`admin_id` bigint unsigned NOT NULL,
	`role_id` bigint unsigned NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `sys_admin_role_id` PRIMARY KEY(`id`),
	CONSTRAINT `uk_admin_role` UNIQUE(`admin_id`,`role_id`)
);
--> statement-breakpoint
CREATE TABLE `sys_menu` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`parent_id` bigint unsigned NOT NULL DEFAULT 0,
	`menu_type` enum('D','M','B') NOT NULL DEFAULT 'M',
	`menu_name` varchar(50) NOT NULL,
	`permission` varchar(100),
	`path` varchar(200),
	`component` varchar(200),
	`icon` varchar(100),
	`sort` int unsigned NOT NULL DEFAULT 0,
	`visible` tinyint unsigned NOT NULL DEFAULT 1,
	`status` tinyint unsigned NOT NULL DEFAULT 1,
	`is_external` tinyint unsigned NOT NULL DEFAULT 0,
	`is_cache` tinyint unsigned NOT NULL DEFAULT 1,
	`remark` varchar(500),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sys_menu_id` PRIMARY KEY(`id`),
	CONSTRAINT `uk_permission` UNIQUE(`permission`)
);
--> statement-breakpoint
CREATE TABLE `sys_operation_log` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`admin_id` bigint unsigned,
	`admin_name` varchar(50),
	`module` varchar(50),
	`operation` varchar(50),
	`description` varchar(500),
	`method` varchar(200),
	`request_method` varchar(10),
	`request_url` varchar(500),
	`request_params` text,
	`response_result` text,
	`ip` varchar(50),
	`ip_location` varchar(100),
	`user_agent` varchar(500),
	`execution_time` bigint unsigned,
	`status` tinyint unsigned NOT NULL DEFAULT 1,
	`error_msg` text,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `sys_operation_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sys_role` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`role_name` varchar(50) NOT NULL,
	`sort` int unsigned NOT NULL DEFAULT 0,
	`status` tinyint unsigned NOT NULL DEFAULT 1,
	`remark` varchar(500),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sys_role_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sys_role_menu` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`role_id` bigint unsigned NOT NULL,
	`menu_id` bigint unsigned NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `sys_role_menu_id` PRIMARY KEY(`id`),
	CONSTRAINT `uk_role_menu` UNIQUE(`role_id`,`menu_id`)
);
--> statement-breakpoint
CREATE TABLE `sys_config` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`config_key` varchar(100) NOT NULL,
	`config_value` text,
	`config_type` varchar(20) NOT NULL DEFAULT 'string',
	`config_group` varchar(50) NOT NULL DEFAULT 'general',
	`config_name` varchar(100) NOT NULL,
	`remark` varchar(255),
	`is_system` tinyint unsigned NOT NULL DEFAULT 0,
	`status` tinyint unsigned NOT NULL DEFAULT 1,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sys_config_id` PRIMARY KEY(`id`),
	CONSTRAINT `uk_config_key` UNIQUE(`config_key`)
);
--> statement-breakpoint
CREATE INDEX `idx_status` ON `sys_admin` (`status`);--> statement-breakpoint
CREATE INDEX `idx_admin_id` ON `sys_admin_role` (`admin_id`);--> statement-breakpoint
CREATE INDEX `idx_role_id` ON `sys_admin_role` (`role_id`);--> statement-breakpoint
CREATE INDEX `idx_parent_id` ON `sys_menu` (`parent_id`);--> statement-breakpoint
CREATE INDEX `idx_sort` ON `sys_menu` (`sort`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `sys_menu` (`status`);--> statement-breakpoint
CREATE INDEX `idx_menu_type` ON `sys_menu` (`menu_type`);--> statement-breakpoint
CREATE INDEX `idx_admin_id` ON `sys_operation_log` (`admin_id`);--> statement-breakpoint
CREATE INDEX `idx_module` ON `sys_operation_log` (`module`);--> statement-breakpoint
CREATE INDEX `idx_operation` ON `sys_operation_log` (`operation`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `sys_operation_log` (`status`);--> statement-breakpoint
CREATE INDEX `idx_created_at` ON `sys_operation_log` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `sys_role` (`status`);--> statement-breakpoint
CREATE INDEX `idx_sort` ON `sys_role` (`sort`);--> statement-breakpoint
CREATE INDEX `idx_role_id` ON `sys_role_menu` (`role_id`);--> statement-breakpoint
CREATE INDEX `idx_menu_id` ON `sys_role_menu` (`menu_id`);--> statement-breakpoint
CREATE INDEX `idx_group` ON `sys_config` (`config_group`);