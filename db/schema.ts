import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const profiles = sqliteTable('profiles', {
  userId: text('user_id').primaryKey(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  role: text('role', { enum: ['client', 'coach'] }).notNull().default('client'),
  goal: text('goal').notNull().default('Build muscle'),
  level: text('level', { enum: ['Basic', 'Intermediate', 'Advanced'] }).notNull().default('Intermediate'),
  trainingPlace: text('training_place', { enum: ['Home', 'Gym'] }).notNull().default('Gym'),
  daysPerWeek: integer('days_per_week').notNull().default(4),
  onboardingComplete: integer('onboarding_complete', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [index('idx_profiles_role').on(table.role)]);

export const clientState = sqliteTable('client_state', {
  userId: text('user_id').primaryKey().references(() => profiles.userId, { onDelete: 'cascade' }),
  currentProgram: text('current_program').notNull(),
  currentWeek: integer('current_week').notNull().default(1),
  currentSession: integer('current_session').notNull().default(1),
  completedSessions: integer('completed_sessions').notNull().default(0),
  streak: integer('streak').notNull().default(0),
  readiness: integer('readiness').notNull().default(82),
  updatedAt: text('updated_at').notNull(),
});

export const workoutLogs = sqliteTable('workout_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => profiles.userId, { onDelete: 'cascade' }),
  workoutId: text('workout_id').notNull(),
  workoutTitle: text('workout_title').notNull(),
  completedExercises: integer('completed_exercises').notNull().default(0),
  totalExercises: integer('total_exercises').notNull(),
  durationSeconds: integer('duration_seconds').notNull().default(0),
  status: text('status', { enum: ['active', 'complete'] }).notNull().default('active'),
  startedAt: text('started_at').notNull(),
  completedAt: text('completed_at'),
}, (table) => [index('idx_workout_logs_user_started').on(table.userId, table.startedAt)]);

export const checkins = sqliteTable('checkins', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => profiles.userId, { onDelete: 'cascade' }),
  energy: integer('energy').notNull(),
  sleep: integer('sleep').notNull(),
  stress: integer('stress').notNull(),
  biggestWin: text('biggest_win').notNull(),
  notes: text('notes').notNull().default(''),
  createdAt: text('created_at').notNull(),
}, (table) => [index('idx_checkins_user_created').on(table.userId, table.createdAt)]);

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => profiles.userId, { onDelete: 'cascade' }),
  direction: text('direction', { enum: ['coach', 'client'] }).notNull(),
  body: text('body').notNull(),
  createdAt: text('created_at').notNull(),
}, (table) => [index('idx_messages_user_created').on(table.userId, table.createdAt)]);
