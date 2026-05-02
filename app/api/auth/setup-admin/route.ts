import { NextRequest, NextResponse } from 'next/server';
import { createSessionCookieValue, getSessionCookieName, hashPassword } from '@/lib/auth';
import { countAdmins, createAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { full_name, email, password } = (await req.json()) as {
      full_name?: string;
      email?: string;
      password?: string;
    };

    if (!full_name || !email || !password) {
      return NextResponse.json(
        { error: 'full_name, email and password are required.' },
        { status: 400 },
      );
    }

    if ((await countAdmins()) > 0) {
      return NextResponse.json({ error: 'Admin account already exists.' }, { status: 409 });
    }

    const admin = await createAdmin({
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      password_hash: hashPassword(password),
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(
      getSessionCookieName(),
      createSessionCookieValue({
        id: admin.id,
        role: 'admin',
        email: admin.email,
        name: admin.full_name,
        barber_id: null,
      }),
      {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    );

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected setup error' },
      { status: 500 },
    );
  }
}
