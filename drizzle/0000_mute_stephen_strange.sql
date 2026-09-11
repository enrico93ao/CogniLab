CREATE TABLE `profile` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`goal` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`exercise` text NOT NULL,
	`level` integer NOT NULL,
	`correct` integer NOT NULL,
	`total` integer NOT NULL,
	`seconds` integer NOT NULL,
	`created` text NOT NULL
);
