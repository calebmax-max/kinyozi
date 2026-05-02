import { randomBytes, scryptSync, timingSafeEqual, createHmac } from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export type SessionUser = {
  id: string;
  role: 'admin' | 'barber';
  email: string;
  name: string;
  barber_id: string | null;
};

const SESSION_COOKIE = 'kinyozi_session';

function getAuthSecret() {
  return (
    process.env.AUTH_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'kinyozi-local-dev-secret'
  );
}

function sign(value: string) {
  return createHmac('sha256', getAuthSecret()).update(value).digest('hex');
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, expectedHex] = storedHash.split(':');

  if (!salt || !expectedHex) {
    return false;
  }

  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, 'hex');

  if (actual.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(actual, expected);
}

export function createSessionCookieValue(user: SessionUser) {
  const payload = {
    ...user,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${sign(encoded)}`;
}

function parseSessionCookieValue(value?: string) {
  if (!value) {
    return null;
  }

  const [encoded, signature] = value.split('.');

  if (!encoded || !signature || sign(encoded) !== signature) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionUser & {
      exp: number;
    };

    if (parsed.exp < Date.now()) {
      return null;
    }

    return {
      id: parsed.id,
      role: parsed.role,
      email: parsed.email,
      name: parsed.name,
      barber_id: parsed.barber_id,
    } satisfies SessionUser;
  } catch {
    return null;
  }
}

export function getSessionUser() {
  const cookieStore = cookies();
  return parseSessionCookieValue(cookieStore.get(SESSION_COOKIE)?.value);
}

export function requireAdminSession() {
  const user = getSessionUser();

  if (!user || user.role !== 'admin') {
    redirect('/login');
  }

  return user;
}

export function requireBarberSession() {
  const user = getSessionUser();

  if (!user || user.role !== 'barber' || !user.barber_id) {
    redirect('/login');
  }

  return user;
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}
