CREATE TABLE `checkins` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`energy` integer NOT NULL,
	`sleep` integer NOT NULL,
	`stress` integer NOT NULL,
	`biggest_win` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `client_state` (
	`user_id` text PRIMARY KEY NOT NULL,
	`current_program` text NOT NULL,
	`current_week` integer DEFAULT 1 NOT NULL,
	`current_session` integer DEFAULT 1 NOT NULL,
	`completed_sessions` integer DEFAULT 0 NOT NULL,
	`streak` integer DEFAULT 0 NOT NULL,
	`readiness` integer DEFAULT 82 NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`direction` text NOT NULL,
	`body` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'client' NOT NULL,
	`goal` text DEFAULT 'Build muscle' NOT NULL,
	`level` text DEFAULT 'Intermediate' NOT NULL,
	`training_place` text DEFAULT 'Gym' NOT NULL,
	`days_per_week` integer DEFAULT 4 NOT NULL,
	`onboarding_complete` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workout_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`workout_id` text NOT NULL,
	`workout_title` text NOT NULL,
	`completed_exercises` integer DEFAULT 0 NOT NULL,
	`total_exercises` integer NOT NULL,
	`duration_seconds` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`started_at` text NOT NULL,
	`completed_at` text
);
