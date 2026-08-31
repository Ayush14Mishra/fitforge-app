import { ensureDatabase, getDatabase, getRequestUser, jsonError } from '@/lib/db';

const levels = ['Basic', 'Intermediate', 'Advanced'];
const places = ['Home', 'Gym'];
const programs: Record<string, string> = {
  'Basic-Home': 'Foundation Flow', 'Basic-Gym': 'Gym Foundations',
  'Intermediate-Home': 'Dumbbell Build', 'Intermediate-Gym': 'Strength Engine',
  'Advanced-Home': 'Density Protocol', 'Advanced-Gym': 'Performance Block',
};

export async function POST(request: Request) {
  const user = await getRequestUser(request);
  if (!user) return jsonError('Sign in is required.', 401);

  const body = await request.json() as Record<string, unknown>;
  const level = String(body.level ?? '');
  const trainingPlace = String(body.trainingPlace ?? '');
  const goal = String(body.goal ?? '').trim().slice(0, 80);
  const daysPerWeek = Number(body.daysPerWeek);

  if (!levels.includes(level) || !places.includes(trainingPlace) || !goal || daysPerWeek < 2 || daysPerWeek > 6) {
    return jsonError('Please complete every onboarding choice.');
  }

  await ensureDatabase();
  const db = getDatabase();
  const now = new Date().toISOString();
  const program = programs[`${level}-${trainingPlace}`];

  await db.batch([
    db.prepare(`INSERT INTO profiles
      (user_id, email, name, role, goal, level, training_place, days_per_week, onboarding_complete, created_at, updated_at)
      VALUES (?, ?, 'Arya', 'client', ?, ?, ?, ?, 1, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET email = excluded.email, name = 'Arya', goal = excluded.goal,
      level = excluded.level, training_place = excluded.training_place, days_per_week = excluded.days_per_week,
      onboarding_complete = 1, updated_at = excluded.updated_at`)
      .bind(user.id, user.email, goal, level, trainingPlace, daysPerWeek, now, now),
    db.prepare(`INSERT INTO client_state
      (user_id, current_program, current_week, current_session, completed_sessions, streak, readiness, updated_at)
      VALUES (?, ?, 1, 1, 0, 0, 82, ?)
      ON CONFLICT(user_id) DO UPDATE SET current_program = excluded.current_program, current_week = 1,
      current_session = 1, updated_at = excluded.updated_at`)
      .bind(user.id, program, now),
  ]);

  const [profile, state] = await Promise.all([
    db.prepare('SELECT * FROM profiles WHERE user_id = ?').bind(user.id).first(),
    db.prepare('SELECT * FROM client_state WHERE user_id = ?').bind(user.id).first(),
  ]);
  return Response.json({ profile, state });
}
