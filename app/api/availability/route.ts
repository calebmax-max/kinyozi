import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { deleteAvailability, listAvailability, upsertAvailability } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const barberId = searchParams.get('barber_id');
    const day = searchParams.get('day');

    if (!barberId || !day) {
      return NextResponse.json({ error: 'barber_id and day are required' }, { status: 400 });
    }

    const data = await listAvailability(barberId, day);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected availability error' },
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
      barber_id?: string;
      day?: string;
      time_slot?: string;
      is_booked?: boolean;
    };

    if (!body.barber_id || !body.day || !body.time_slot) {
      return NextResponse.json(
        { error: 'barber_id, day and time_slot are required' },
        { status: 400 },
      );
    }

    const data = await upsertAvailability({
      barber_id: body.barber_id,
      day: body.day,
      time_slot: body.time_slot,
      is_booked: body.is_booked ?? false,
    });

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected availability error' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = getSessionUser();

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    await deleteAvailability(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected availability delete error' },
      { status: 500 },
    );
  }
}
