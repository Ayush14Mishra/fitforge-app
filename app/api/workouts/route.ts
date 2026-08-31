import { ensureDatabase, getDatabase, getRequestUser, jsonError } from '@/lib/db';

export async function POST(request: Request) {
  const user = await getRequestUser(request);
  if (!user) return jsonError('Sign in is required.', 401);
  const body = await request.json() as Record<string, unknown>;
  const action = String(body.action ?? '');

  await ensureDatabase();
  const db = getDatabase();
  const now = new Date().toISOString();

  if (action === 'start') {
    const id = crypto.randomUUID();
    const title = String(body.title ?? 'Upper Body Strength').slice(0, 100);
    const total = Math.max(1, Math.min(20, Number(body.totalExercises) || 5));
    await db.prepare(`INSERT INTO workout_logs
      (id, user_id, workout_id, workout_title, completed_exercises, total_exercises, duration_seconds, status, started_at)
      VALUES (?, ?, ?, ?, 0, ?, 0, 'active', ?)`)
      .bind(id, user.id, String(body.workoutId ?? 'upper-strength'), title, total, now).run();
    return Response.json({ id, startedAt: now });
  }

  const id = String(body.id ?? '');
  if (!id) return jsonError('Workout session was not found.');
  const completed = Math.max(0, Math.min(20, Number(body.completedExercises) || 0));
  const duration = Math.max(0, Math.min(86400, Number(body.durationSeconds) || 0));

  if (action === 'progress') {
    await db.prepare(`UPDATE workout_logs SET completed_exercises = ?, duration_seconds = ?
      WHERE id = ? AND user_id = ? AND status = 'active'`)
      .bind(completed, duration, id, user.id).run();
    return Response.json({ saved: true });
  }

  if (action === 'complete') {
    const result = await db.prepare(`UPDATE workout_logs SET completed_exercises = total_exercises,
      duration_seconds = ?, status = 'complete', completed_at = ?
      WHERE id = ? AND user_id = ? AND status = 'active'`)
      .bind(duration, now, id, user.id).run();
    if (!result.meta.changes) return jsonError('Workout session was already completed.', 409);
    await db.prepare(`UPDATE client_state SET completed_sessions = completed_sessions + 1,
      current_session = current_session + 1, streak = streak + 1, updated_at = ? WHERE user_id = ?`)
      .bind(now, user.id).run();
    const state = await db.prepare('SELECT * FROM client_state WHERE user_id = ?').bind(user.id).first();
    return Response.json({ completed: true, state });
  }

  return jsonError('Unknown workout action.');
}
