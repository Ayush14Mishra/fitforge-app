import { ensureDatabase, getDatabase, getRequestUser, jsonError } from '@/lib/db';

export async function POST(request: Request) {
  const user = await getRequestUser(request);
  if (!user) return jsonError('Sign in is required.', 401);
  const body = await request.json() as Record<string, unknown>;
  const message = String(body.message ?? '').trim().slice(0, 1000);
  if (!message) return jsonError('Write a message first.');
  await ensureDatabase();
  const db = getDatabase();
  const id = crypto.randomUUID(); const createdAt = new Date().toISOString();
  await db.prepare(`INSERT INTO messages (id, user_id, direction, body, created_at)
    VALUES (?, ?, 'client', ?, ?)`)
    .bind(id, user.id, message, createdAt).run();
  return Response.json({ id, direction: 'client', body: message, created_at: createdAt });
}
