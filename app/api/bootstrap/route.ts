import { ensureDatabase, getDatabase, getRequestUser, jsonError } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const user = await getRequestUser(request);
  if (!user) return jsonError('Sign in is required.', 401);

  await ensureDatabase();
  const db = getDatabase();
  const now = new Date().toISOString();

  await db.batch([
    db.prepare(`INSERT OR IGNORE INTO profiles
      (user_id, email, name, role, goal, level, training_place, days_per_week, onboarding_complete, created_at, updated_at)
      VALUES (?, ?, 'Arya', 'client', 'Build muscle', 'Intermediate', 'Gym', 4, 0, ?, ?)`)
      .bind(user.id, user.email, now, now),
    db.prepare(`INSERT OR IGNORE INTO client_state
      (user_id, current_program, current_week, current_session, completed_sessions, streak, readiness, updated_at)
      VALUES (?, 'Strength Engine', 1, 1, 0, 0, 82, ?)`)
      .bind(user.id, now),
  ]);

  const [profile, state, workouts, checkins, messages] = await Promise.all([
    db.prepare('SELECT * FROM profiles WHERE user_id = ?').bind(user.id).first(),
    db.prepare('SELECT * FROM client_state WHERE user_id = ?').bind(user.id).first(),
    db.prepare(`SELECT id, workout_title, completed_exercises, total_exercises, duration_seconds, status, started_at, completed_at
      FROM workout_logs WHERE user_id = ? ORDER BY started_at DESC LIMIT 12`).bind(user.id).all(),
    db.prepare(`SELECT id, energy, sleep, stress, biggest_win, notes, created_at
      FROM checkins WHERE user_id = ? ORDER BY created_at DESC LIMIT 4`).bind(user.id).all(),
    db.prepare(`SELECT id, direction, body, created_at
      FROM messages WHERE user_id = ? ORDER BY created_at ASC LIMIT 50`).bind(user.id).all(),
  ]);

  return Response.json({ profile, state, workouts: workouts.results, checkins: checkins.results, messages: messages.results });
}
