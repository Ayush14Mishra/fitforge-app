import { env } from 'cloudflare:workers';
import { decodeProtectedHeader, importX509, jwtVerify } from 'jose';

type FitForgeEnv = { DB: D1Database };

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS profiles (
    user_id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'client' CHECK(role IN ('client', 'coach')),
    goal TEXT NOT NULL DEFAULT 'Build muscle',
    level TEXT NOT NULL DEFAULT 'Intermediate' CHECK(level IN ('Basic', 'Intermediate', 'Advanced')),
    training_place TEXT NOT NULL DEFAULT 'Gym' CHECK(training_place IN ('Home', 'Gym')),
    days_per_week INTEGER NOT NULL DEFAULT 4 CHECK(days_per_week BETWEEN 2 AND 6),
    onboarding_complete INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS client_state (
    user_id TEXT PRIMARY KEY,
    current_program TEXT NOT NULL,
    current_week INTEGER NOT NULL DEFAULT 1,
    current_session INTEGER NOT NULL DEFAULT 1,
    completed_sessions INTEGER NOT NULL DEFAULT 0,
    streak INTEGER NOT NULL DEFAULT 0,
    readiness INTEGER NOT NULL DEFAULT 82,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS workout_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    workout_id TEXT NOT NULL,
    workout_title TEXT NOT NULL,
    completed_exercises INTEGER NOT NULL DEFAULT 0,
    total_exercises INTEGER NOT NULL,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'complete')),
    started_at TEXT NOT NULL,
    completed_at TEXT,
    FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS checkins (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    energy INTEGER NOT NULL CHECK(energy BETWEEN 1 AND 10),
    sleep INTEGER NOT NULL CHECK(sleep BETWEEN 1 AND 10),
    stress INTEGER NOT NULL CHECK(stress BETWEEN 1 AND 10),
    biggest_win TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    direction TEXT NOT NULL CHECK(direction IN ('coach', 'client')),
    body TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS idx_workout_logs_user_started ON workout_logs(user_id, started_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_checkins_user_created ON checkins(user_id, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_messages_user_created ON messages(user_id, created_at ASC)`,
];

let setupPromise: Promise<void> | undefined;

export function getDatabase() {
  return (env as unknown as FitForgeEnv).DB;
}

export function ensureDatabase() {
  if (!setupPromise) {
    const db = getDatabase();
    setupPromise = db.batch(schemaStatements.map((sql) => db.prepare(sql)))
      .then(() => db.prepare('PRAGMA optimize').run())
      .then(() => undefined)
      .catch((error) => {
        setupPromise = undefined;
        throw error;
      });
  }
  return setupPromise;
}

const firebaseProjectId = 'fitforge-coach-app-arya';
const firebaseCertsUrl = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
let firebaseCerts: { values: Record<string, string>; expiresAt: number } | undefined;

async function getFirebaseCertificates() {
  if (firebaseCerts && firebaseCerts.expiresAt > Date.now()) return firebaseCerts.values;
  const response = await fetch(firebaseCertsUrl);
  if (!response.ok) throw new Error('Could not load Firebase signing certificates.');
  const values = await response.json() as Record<string, string>;
  const maxAge = Number(response.headers.get('cache-control')?.match(/max-age=(\d+)/)?.[1] ?? 3600);
  firebaseCerts = { values, expiresAt: Date.now() + maxAge * 1000 };
  return values;
}

export async function getRequestUser(request: Request) {
  const token = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (token) {
    try {
      const { kid, alg } = decodeProtectedHeader(token);
      if (!kid || alg !== 'RS256') return null;
      const certificate = (await getFirebaseCertificates())[kid];
      if (!certificate) return null;
      const publicKey = await importX509(certificate, 'RS256');
      const { payload } = await jwtVerify(token, publicKey, {
        algorithms: ['RS256'],
        audience: firebaseProjectId,
        issuer: `https://securetoken.google.com/${firebaseProjectId}`,
      });
      if (!payload.sub) return null;
      const email = typeof payload.email === 'string'
        ? payload.email
        : typeof payload.phone_number === 'string'
          ? payload.phone_number
          : `${payload.sub}@phone.fitforge`;
      const name = typeof payload.name === 'string' && payload.name.trim() ? payload.name.trim() : 'Arya';
      return { id: payload.sub, email, name };
    } catch {
      return null;
    }
  }

  const hostname = new URL(request.url).hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return { id: 'local-arya', email: 'arya@fitforge.local', name: 'Arya' };
  }

  return null;
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
