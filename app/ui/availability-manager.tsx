'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Availability, Barber } from '@/lib/supabase';

type AvailabilityManagerProps = {
  barbers: Barber[];
};

type State =
  | { type: 'idle' }
  | { type: 'success'; message: string }
  | { type: 'error'; message: string };

export function AvailabilityManager({ barbers }: AvailabilityManagerProps) {
  const router = useRouter();
  const [barberId, setBarberId] = useState(barbers[0]?.id ?? '');
  const [day, setDay] = useState(new Date().toISOString().slice(0, 10));
  const [timeSlot, setTimeSlot] = useState('09:00');
  const [slots, setSlots] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [state, setState] = useState<State>({ type: 'idle' });

  async function loadSlots(selectedBarberId: string, selectedDay: string) {
    if (!selectedBarberId || !selectedDay) {
      setSlots([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/availability?barber_id=${encodeURIComponent(selectedBarberId)}&day=${encodeURIComponent(selectedDay)}`,
      );
      const result = await response.json();

      if (!response.ok) {
        setState({ type: 'error', message: result.error ?? 'Could not load availability.' });
        setSlots([]);
        return;
      }

      setSlots(result.data ?? []);
    } catch (error) {
      setState({
        type: 'error',
        message: error instanceof Error ? error.message : 'Could not load availability.',
      });
      setSlots([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadSlots(barberId, day);
  }, [barberId, day]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!barberId) {
      setState({ type: 'error', message: 'Select a barber first.' });
      return;
    }

    setIsSaving(true);
    setState({ type: 'idle' });

    try {
      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          barber_id: barberId,
          day,
          time_slot: timeSlot,
          is_booked: false,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setState({ type: 'error', message: result.error ?? 'Could not save slot.' });
        return;
      }

      setState({ type: 'success', message: 'Availability slot saved.' });
      await loadSlots(barberId, day);
      router.refresh();
    } catch (error) {
      setState({
        type: 'error',
        message: error instanceof Error ? error.message : 'Could not save slot.',
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(slotId: string) {
    setState({ type: 'idle' });

    const response = await fetch(`/api/availability?id=${encodeURIComponent(slotId)}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (!response.ok) {
      setState({ type: 'error', message: result.error ?? 'Could not remove slot.' });
      return;
    }

    setState({ type: 'success', message: 'Availability slot removed.' });
    await loadSlots(barberId, day);
    router.refresh();
  }

  return (
    <div className="admin-grid">
      <section className="panel">
        <h2>Set barber availability</h2>
        <p className="muted">
          Choose a barber, date, and time. Saved slots immediately become available for booking.
        </p>
        <form className="form-grid" onSubmit={handleCreate}>
          <div className="field">
            <label htmlFor="availability_barber">Barber</label>
            <select
              id="availability_barber"
              value={barberId}
              onChange={(event) => setBarberId(event.target.value)}
              required
            >
              {barbers.length === 0 ? (
                <option value="">Add a barber first</option>
              ) : null}
              {barbers.map((barber) => (
                <option key={barber.id} value={barber.id}>
                  {barber.name} - {barber.shop_name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="availability_day">Date</label>
            <input
              id="availability_day"
              type="date"
              value={day}
              onChange={(event) => setDay(event.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="availability_time">Time slot</label>
            <input
              id="availability_time"
              value={timeSlot}
              onChange={(event) => setTimeSlot(event.target.value)}
              placeholder="09:00"
              required
            />
          </div>
          <button className="button" type="submit" disabled={isSaving || barbers.length === 0}>
            {isSaving ? 'Saving...' : 'Save slot'}
          </button>
        </form>
        {state.type === 'success' ? <div className="status success">{state.message}</div> : null}
        {state.type === 'error' ? <div className="status error">{state.message}</div> : null}
      </section>

      <section className="panel">
        <h2>Slots for selected day</h2>
        <p className="muted">
          Review current time slots and remove any open slot you no longer want to offer.
        </p>
        {isLoading ? <div className="empty-state">Loading slots...</div> : null}
        {!isLoading && slots.length === 0 ? (
          <div className="empty-state">No slots saved for this barber and date yet.</div>
        ) : null}
        {!isLoading && slots.length > 0 ? (
          <div className="slot-list">
            {slots.map((slot) => (
              <div className="slot-row" key={slot.id}>
                <div>
                  <strong>{slot.time_slot}</strong>
                  <p className="muted">{slot.is_booked ? 'Booked' : 'Open'}</p>
                </div>
                <button
                  className="button-secondary"
                  type="button"
                  disabled={slot.is_booked}
                  onClick={() => handleDelete(slot.id)}
                >
                  {slot.is_booked ? 'Booked slot' : 'Remove'}
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
