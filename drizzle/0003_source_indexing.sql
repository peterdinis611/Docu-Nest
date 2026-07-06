ALTER TABLE `sources` ADD `source_url` text;
--> statement-breakpoint
ALTER TABLE `sources` ADD `extracted_text` text;
--> statement-breakpoint
ALTER TABLE `sources` ADD `index_status` text DEFAULT 'pending' NOT NULL;
--> statement-breakpoint
CREATE TABLE `source_chunks` (
	`id` text PRIMARY KEY NOT NULL,
	`source_id` text NOT NULL,
	`chunk_index` integer NOT NULL,
	`text` text NOT NULL,
	`embedding` text,
	`source_title` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `messages` ADD `mode` text;
--> statement-breakpoint
ALTER TABLE `saved_notes` ADD `body` text DEFAULT '' NOT NULL;
