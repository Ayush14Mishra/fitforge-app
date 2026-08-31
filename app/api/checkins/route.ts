import { ensureDatabase, getDatabase, getRequestUser, jsonError } from '@/lib/db';

export async function POST(request: Request) {
  const user = await getRequestUser(request);
  if (!user) return jsonError('Sign in is required.', 401);
  const body = await request.json() as Record<string, unknown>;
  const energy = Number(body.energy); const sleep = Number(body.sleep); const stress = Number(body.stress);
  const biggestWin = String(body.biggestWin ?? '').trim().slice(0, 500);
  const notes = String(body.notes ?? '').trim().slice(0, 1000);
  if ([energy, sleep, stress].some((value) => value < 1 || value > 10) || !biggestWin) {
    return jsonError('Add your scores and biggest win before sending.');
  }
  await ensureDatabase();
  const db = getDatabase();
  const id = crypto.randomUUID(); const createdAt = new Date().toISOString();
  await db.prepare(`INSERT INTO checkins (id, user_id, energy, sleep, stress, biggest_win, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(id, user.id, energy, sleep, stress, biggestWin, notes, createdAt).run();
  return Response.json({ id, createdAt });
}
