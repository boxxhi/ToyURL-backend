CREATE TABLE `global_links` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`original_link` text NOT NULL,
	`code` text NOT NULL,
	`created_at` integer NOT NULL
);
