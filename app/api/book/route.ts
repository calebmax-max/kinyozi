import { NextRequest, NextResponse } from 'next/server';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { createBooking, findAssignableBarber } from '@/lib/supabase';

function validateBookingPayload(payload: Record<string, unknown>) {
  const requiredFields = [
    'barber_id',
    'service',
    'day',
    'time_slot',
    'customer_name',
    'customer_phone',
  ] as const;

  for (const field of requiredFields) {
    const value = payload[field];
    if (typeof value !== 'string' || value.trim().length === 0) {
      return `${field} is required`;
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as Record<string, unknown>;
    const validationError = validateBookingPayload(payload);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const service = String(payload.service);
    const timeSlot = String(payload.time_slot);
    const assignment = await findAssignableBarber({
      requested_barber_id: String(payload.barber_id),
      day: String(payload.day),
      time_slot: timeSlot,
      service,
    });

    if (!assignment) {
      return NextResponse.json(
        {
          error:
            'All barbers are booked for that time. Please choose another time.',
        },
        { status: 409 },
      );
    }

    await createBooking({
      barber_id: assignment.barber.id,
      requested_barber_id: String(payload.barber_id),
      service,
      day: String(payload.day),
      time_slot: timeSlot,
      end_time: assignment.end_time,
      duration_minutes: assignment.duration_minutes,
      reassigned: assignment.reassigned,
      customer_name: String(payload.customer_name),
      customer_phone: String(payload.customer_phone),
      status: 'pending',
    });

    const barberWhatsAppMessage = [
      'New booking request',
      `Customer: ${String(payload.customer_name)}`,
      `Phone: ${String(payload.customer_phone)}`,
      `Service: ${service}`,
      `Date: ${String(payload.day)}`,
      `Time: ${timeSlot}`,
      `Barber: ${assignment.barber.name}`,
      assignment.reassigned ? 'Note: reassigned because the requested barber was busy.' : null,
    ]
      .filter(Boolean)
      .join('\n');

    const customerWhatsAppMessage = [
      'Booking confirmation',
      `Hello ${String(payload.customer_name)},`,
      `Your ${service} appointment is booked for ${String(payload.day)} at ${timeSlot}.`,
      `Barber: ${assignment.barber.name}`,
      `Shop: ${assignment.barber.shop_name}`,
      assignment.reassigned
        ? 'Your selected barber was busy, so we assigned the next free barber for that time.'
        : null,
    ]
      .filter(Boolean)
      .join('\n');

    return NextResponse.json({
      ok: true,
      assignedBarberName: assignment.barber.name,
      durationMinutes: assignment.duration_minutes,
      wasReassigned: assignment.reassigned,
      barberWa: buildWhatsAppLink(assignment.barber.phone, barberWhatsAppMessage),
      customerWa: buildWhatsAppLink(String(payload.customer_phone), customerWhatsAppMessage),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unexpected booking error',
      },
      { status: 500 },
    );
  }
}
