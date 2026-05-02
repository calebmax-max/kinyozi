import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getBookingById, listBookings, updateBookingStatus } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionUser();
    const { searchParams } = new URL(req.url);
    const requestedBarberId = searchParams.get('barber_id') ?? undefined;
    const barberId =
      session?.role === 'barber' && session.barber_id ? session.barber_id : requestedBarberId;
    const data = await listBookings(barberId);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected bookings error' },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = getSessionUser();
    const { id, status } = (await req.json()) as { id?: string; status?: string };
    const allowed = ['pending', 'completed', 'cancelled'];

    if (!id || !status) {
      return NextResponse.json({ error: 'id and status are required' }, { status: 400 });
    }

    if (!allowed.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const booking = await getBookingById(id);

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (session.role === 'barber' && booking.barber_id !== session.barber_id) {
      return NextResponse.json({ error: 'You can only update your own bookings.' }, { status: 403 });
    }

    const data = await updateBookingStatus(id, status);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected update error' },
      { status: 500 },
    );
  }
}
