import { NextRequest, NextResponse } from 'next/server';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { findAssignableBarber, createBooking, markAvailabilityBooked } from '@/lib/supabase';
import { getServiceDurationMinutes } from '@/lib/services';

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

    const assignment = await findAssignableBarber({
      requested_barber_id: String(payload.barber_id),
      day: String(payload.day),
      time_slot: String(payload.time_slot),
      service: String(payload.service),
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'No barber is available for this service at the selected time.' },
        { status: 409 },
      );
    }

    await createBooking({
      barber_id: assignment.barber.id,
      requested_barber_id: String(payload.barber_id),
      service: String(payload.service),
      day: String(payload.day),
      time_slot: String(payload.time_slot),
      end_time: assignment.end_time,
      duration_minutes: assignment.duration_minutes,
      reassigned: assignment.reassigned,
      customer_name: String(payload.customer_name),
      customer_phone: String(payload.customer_phone),
      status: 'pending',
    });

    await markAvailabilityBooked(assignment.slots.map((slot) => slot.id));

    const customerMessage = assignment.reassigned
      ? `Your ${String(payload.service)} booking at ${String(payload.time_slot)} has been assigned to ${assignment.barber.name}.`
      : `Your ${String(payload.service)} booking at ${String(payload.time_slot)} is confirmed with ${assignment.barber.name}.`;

    return NextResponse.json({
      ok: true,
      assignedBarberName: assignment.barber.name,
      durationMinutes: assignment.duration_minutes ?? getServiceDurationMinutes(String(payload.service)),
      wasReassigned: assignment.reassigned,
      customerWa: buildWhatsAppLink(String(payload.customer_phone), customerMessage),
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
