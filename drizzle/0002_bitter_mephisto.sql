CREATE TABLE `storage_file` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`file_key` varchar(500) NOT NULL,
	`file_name` varchar(255) NOT NULL,
	`file_size` bigint unsigned NOT NULL,
	`mime_type` varchar(100) NOT NULL DEFAULT 'application/octet-stream',
	`is_public` tinyint unsigned NOT NULL DEFAULT 0,
	`uploader_id` bigint unsigned,
	`uploader_name` varchar(50),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `storage_file_id` PRIMARY KEY(`id`),
	CONSTRAINT `uk_file_key` UNIQUE(`file_key`)
);
--> statement-breakpoint
CREATE INDEX `idx_uploader_id` ON `storage_file` (`uploader_id`);--> statement-breakpoint
CREATE INDEX `idx_mime_type` ON `storage_file` (`mime_type`);