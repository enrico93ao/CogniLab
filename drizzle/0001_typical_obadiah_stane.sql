CREATE TABLE `exercise_results` (
	`id` text PRIMARY KEY NOT NULL,
	`exercise_id` text NOT NULL,
	`finished_at` text NOT NULL,
	`payload` text NOT NULL
);
