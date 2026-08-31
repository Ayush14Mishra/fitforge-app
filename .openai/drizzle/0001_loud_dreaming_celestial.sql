PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_checkins` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`energy` integer NOT NULL,
	`sleep` integer NOT NULL,
	`stress` integer NOT NULL,
	`biggest_win` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_checkins`("id", "user_id", "energy", "sleep", "stress", "biggest_win", "notes", "created_at") SELECT "id", "user_id", "energy", "sleep", "stress", "biggest_win", "notes", "created_at" FROM `checkins`;--> statement-breakpoint
DROP TABLE `checkins`;--> statement-breakpoint
ALTER TABLE `__new_checkins` RENAME TO `checkins`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_checkins_user_created` ON `checkins` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `__new_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`direction` text NOT NULL,
	`body` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_messages`("id", "user_id", "direction", "body", "created_at") SELECT "id", "user_id", "direction", "body", "created_at" FROM `messages`;--> statement-breakpoint
DROP TABLE `messages`;--> statement-breakpoint
ALTER TABLE `__new_messages` RENAME TO `messages`;--> statement-breakpoint
CREATE INDEX `idx_messages_user_created` ON `messages` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_profiles_role` ON `profiles` (`role`);--> statement-breakpoint
CREATE TABLE `__new_workout_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`workout_id` text NOT NULL,
	`workout_title` text NOT NULL,
	`completed_exercises` integer DEFAULT 0 NOT NULL,
	`total_exercises` integer NOT NULL,
	`duration_seconds` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`started_at` text NOT NULL,
	`completed_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_workout_logs`("id", "user_id", "workout_id", "workout_title", "completed_exercises", "total_exercises", "duration_seconds", "status", "started_at", "completed_at") SELECT "id", "user_id", "workout_id", "workout_title", "completed_exercises", "total_exercises", "duration_seconds", "status", "started_at", "completed_at" FROM `workout_logs`;--> statement-breakpoint
DROP TABLE `workout_logs`;--> statement-breakpoint
ALTER TABLE `__new_workout_logs` RENAME TO `workout_logs`;--> statement-breakpoint
CREATE INDEX `idx_workout_logs_user_started` ON `workout_logs` (`user_id`,`started_at`);--> statement-breakpoint
CREATE TABLE `__new_client_state` (
	`user_id` text PRIMARY KEY NOT NULL,
	`current_program` text NOT NULL,
	`current_week` integer DEFAULT 1 NOT NULL,
	`current_session` integer DEFAULT 1 NOT NULL,
	`completed_sessions` integer DEFAULT 0 NOT NULL,
	`streak` integer DEFAULT 0 NOT NULL,
	`readiness` integer DEFAULT 82 NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_client_state`("user_id", "current_program", "current_week", "current_session", "completed_sessions", "streak", "readiness", "updated_at") SELECT "user_id", "current_program", "current_week", "current_session", "completed_sessions", "streak", "readiness", "updated_at" FROM `client_state`;--> statement-breakpoint
DROP TABLE `client_state`;--> statement-breakpoint
ALTER TABLE `__new_client_state` RENAME TO `client_state`;