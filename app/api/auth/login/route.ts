import { NextRequest, NextResponse } from 'next/server';
import { createSessionCookieValue, getSessionCookieName, verifyPassword } from '@/lib/auth';
import { findAdminByEmail, findBarberByEmail } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = (await req.json()) as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const admin = await findAdminByEmail(normalizedEmail);

    if (admin && verifyPassword(password, admin.password_hash)) {
      const response = NextResponse.json({ ok: true, redirectTo: '/dashboard' });
      response.cookies.set(getSessionCookieName(), createSessionCookieValue({
        id: admin.id,
        role: 'admin',
        email: admin.email,
        name: admin.full_name,
        barber_id: null,
      }), {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      });
      return response;
    }

    const barber = await findBarberByEmail(normalizedEmail);

    if (barber && verifyPassword(password, barber.password_hash)) {
      const response = NextResponse.json({ ok: true, redirectTo: '/barber' });
      response.cookies.set(
        getSessionCookieName(),
        createSessionCookieValue({
          id: barber.id,
          role: 'barber',
          email: barber.email,
          name: barber.name,
          barber_id: barber.id,
        }),
        {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure: process.env.NODE_ENV === 'production',
        },
      );
      return response;
    }

    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected login error' },
      { status: 500 },
    );
  }
}
