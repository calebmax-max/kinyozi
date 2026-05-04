'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { SERVICE_OPTIONS } from '@/lib/services';

type Barber = {
  id: string;
  name: string;
  shop_name: string;
};

type BookingFormProps = {
  barbers: Barber[];
};

type SubmissionState =
  | { type: 'idle' }
  | {
      type: 'success';
      message: string;
      assignedBarberName?: string;
      wasReassigned?: boolean;
    }
  | { type: 'error'; message: string };

export function BookingForm({ barbers }: BookingFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<SubmissionState>({ type: 'idle' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (state.type !== 'success') {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setState({ type: 'idle' });
    }, 10000);

    return () => window.clearTimeout(timeoutId);
  }, [state]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setState({ type: 'idle' });
    const form = formRef.current;

    if (!form) {
      setState({ type: 'error', message: 'Unable to submit the form right now.' });
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData(form);

    try {
      const response = await fetch('/api/book', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(formData.entries())),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        setState({
          type: 'error',
          message: result.error ?? 'Unable to complete booking right now.',
        });
        return;
      }

      setState({
        type: 'success',
        message: 'Appointment booked successfully.',
        assignedBarberName: result.assignedBarberName,
        wasReassigned: result.wasReassigned,
      });
      form.reset();
    } catch (error) {
      setState({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to complete booking right now.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="form-grid">
      <div className="field">
        <label htmlFor="barber_id">Barber</label>
        <select id="barber_id" name="barber_id" required defaultValue="">
          <option value="" disabled>
            Select a barber
          </option>
          {barbers.map((barber) => (
            <option key={barber.id} value={barber.id}>
              {barber.name} - {barber.shop_name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="service">Service</label>
        <select id="service" name="service" required defaultValue={SERVICE_OPTIONS[0].value}>
          {SERVICE_OPTIONS.map((service) => (
            <option key={service.value} value={service.value}>
              {service.label} - {service.duration} min
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="day">Appointment date</label>
        <input id="day" type="date" name="day" required />
      </div>

      <div className="field">
        <label htmlFor="time_slot">Time slot</label>
        <input id="time_slot" name="time_slot" placeholder="09:00" required />
      </div>

      <div className="field">
        <label htmlFor="customer_name">Customer name</label>
        <input id="customer_name" name="customer_name" placeholder="John Doe" required />
      </div>

      <div className="field">
        <label htmlFor="customer_phone">Phone number</label>
        <input
          id="customer_phone"
          name="customer_phone"
          placeholder="+2547XXXXXXXX"
          required
        />
      </div>

      <button className="button" type="submit" disabled={isSubmitting || barbers.length === 0}>
        {isSubmitting ? 'Submitting...' : 'Book appointment'}
      </button>

      {barbers.length === 0 ? (
        <div className="status error">
          No barbers found. Add records to the `barbers` table in Supabase first.
        </div>
      ) : null}

      {state.type === 'success' ? (
        <div className="status success">
          {state.message}{' '}
          {state.assignedBarberName
            ? state.wasReassigned
              ? `Successfully assigned to ${state.assignedBarberName} because your selected barber was busy.`
              : `Successfully assigned to ${state.assignedBarberName}.`
            : null}
        </div>
      ) : null}

      {state.type === 'error' ? <div className="status error">{state.message}</div> : null}
    </form>
  );
}
