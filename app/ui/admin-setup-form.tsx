'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export function AdminSetupForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch('/api/auth/setup-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? 'Could not create admin account.');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? submissionError.message : 'Could not create admin account.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="full_name">Full name</label>
        <input id="full_name" name="full_name" placeholder="Shop Manager" required />
      </div>
      <div className="field">
        <label htmlFor="email">Admin email</label>
        <input id="email" name="email" type="email" placeholder="admin@kinyozi.pro" required />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required />
      </div>
      <button className="button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account...' : 'Create admin account'}
      </button>
      {error ? <div className="status error">{error}</div> : null}
    </form>
  );
}
