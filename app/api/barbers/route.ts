import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, hashPassword } from '@/lib/auth';
import { attachBarberLogin, createBarber, getBarbers } from '@/lib/supabase';

export async function GET() {
  try {
    const data = await getBarbers();
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected barbers error' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionUser();

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 401 });
    }

    const body = (await req.json()) as {
      name?: string;
      phone?: string;
      shop_name?: string;
      email?: string;
      password?: string;
    };

    if (!body.name || !body.phone || !body.shop_name || !body.email || !body.password) {
      return NextResponse.json(
        { error: 'name, phone, shop_name, email and password are required' },
        { status: 400 },
      );
    }

    const data = await createBarber({
      name: body.name.trim(),
      phone: body.phone.trim(),
      shop_name: body.shop_name.trim(),
      email: body.email.trim().toLowerCase(),
      password_hash: hashPassword(body.password),
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected create barber error' },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = getSessionUser();

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 401 });
    }

    const body = (await req.json()) as {
      barber_id?: string;
      email?: string;
      password?: string;
    };

    if (!body.barber_id || !body.email || !body.password) {
      return NextResponse.json(
        { error: 'barber_id, email and password are required' },
        { status: 400 },
      );
    }

    const data = await attachBarberLogin({
      barber_id: body.barber_id,
      email: body.email.trim().toLowerCase(),
      password_hash: hashPassword(body.password),
    });

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected attach login error' },
      { status: 500 },
    );
  }
}
