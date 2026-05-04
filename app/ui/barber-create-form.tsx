'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

type SubmissionState =
  | { type: 'idle' }
  | { type: 'success'; message: string }
  | { type: 'error'; message: string };

export function BarberCreateForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [state, setState] = useState<SubmissionState>({ type: 'idle' });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setState({ type: 'idle' });

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch('/api/barbers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });

      const result = await response.json();

      if (!response.ok) {
        setState({ type: 'error', message: result.error ?? 'Could not create barber.' });
        return;
      }

      setState({ type: 'success', message: 'Barber added successfully.' });
      form.reset();
      router.refresh();
    } catch (error) {
      setState({
        type: 'error',
        message: error instanceof Error ? error.message : 'Could not create barber.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="name">Barber name</label>
        <input id="name" name="name" placeholder="James" required />
      </div>
      <div className="field">
        <label htmlFor="phone">Phone number</label>
        <input id="phone" name="phone" placeholder="+2547XXXXXXXX" required />
      </div>
      <div className="field">
        <label htmlFor="shop_name">Shop name</label>
        <input id="shop_name" name="shop_name" placeholder="Kinyozi Pro CBD" required />
      </div>
      <div className="field">
        <label htmlFor="email">Login email</label>
        <input id="email" name="email" type="email" placeholder="james@kinyozi.pro" required />
      </div>
      <div className="field">
        <label htmlFor="password">Temporary password</label>
        <input id="password" name="password" type="password" required />
      </div>
      <button className="button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Add barber'}
      </button>
      {state.type === 'success' ? <div className="status success">{state.message}</div> : null}
      {state.type === 'error' ? <div className="status error">{state.message}</div> : null}
    </form>
  );
}
