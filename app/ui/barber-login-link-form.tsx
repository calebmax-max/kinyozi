'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Barber } from '@/lib/supabase';

type BarberLoginLinkFormProps = {
  barbers: Barber[];
};

export function BarberLoginLinkForm({ barbers }: BarberLoginLinkFormProps) {
  const router = useRouter();
  const candidates = barbers.filter((barber) => !barber.email);
  const [barberId, setBarberId] = useState(candidates[0]?.id ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setError('');
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch('/api/barbers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? 'Could not create login for barber.');
        return;
      }

      setMessage('Login added for barber.');
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? submissionError.message : 'Could not create login for barber.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="barber_id">Barber</label>
        <select
          id="barber_id"
          name="barber_id"
          value={barberId}
          onChange={(event) => setBarberId(event.target.value)}
          required
        >
          {candidates.length === 0 ? <option value="">All barbers already have logins</option> : null}
          {candidates.map((barber) => (
            <option key={barber.id} value={barber.id}>
              {barber.name} - {barber.shop_name}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="existing_barber_email">Login email</label>
        <input id="existing_barber_email" name="email" type="email" required />
      </div>
      <div className="field">
        <label htmlFor="existing_barber_password">Password</label>
        <input id="existing_barber_password" name="password" type="password" required />
      </div>
      <button className="button-secondary" type="submit" disabled={isSubmitting || candidates.length === 0}>
        {isSubmitting ? 'Saving...' : 'Create barber login'}
      </button>
      {message ? <div className="status success">{message}</div> : null}
      {error ? <div className="status error">{error}</div> : null}
    </form>
  );
}
