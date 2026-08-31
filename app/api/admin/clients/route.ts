import { ensureDatabase, getDatabase, getRequestUser, jsonError } from '@/lib/db';

export async function GET(request: Request) {
  const user = await getRequestUser(request);
  if (!user) return jsonError('Sign in is required.', 401);
  await ensureDatabase();
  const db = getDatabase();
  const profile = await db.prepare('SELECT role FROM profiles WHERE user_id = ?').bind(user.id).first<{ role: string }>();
  if (profile?.role !== 'coach') return jsonError('Coach access is required.', 403);
  const clients = await db.prepare(`SELECT p.user_id, p.name, p.email, p.goal, p.level, p.training_place,
    s.current_program, s.current_week, s.completed_sessions, s.streak, s.readiness, s.updated_at
    FROM profiles p JOIN client_state s ON s.user_id = p.user_id
    WHERE p.role = 'client' ORDER BY s.updated_at DESC`).all();
  return Response.json({ clients: clients.results });
}
