'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

type LoginFormProps = {
  showSetupLink: boolean;
};

export function LoginForm({ showSetupLink }: LoginFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    const form = event.currentTarget;

    const formData = new FormData(form);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? 'Login failed.');
        return;
      }

      router.push(result.redirectTo ?? '/dashboard');
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" placeholder="admin@kinyozi.pro" required />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required />
      </div>
      <button className="button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </button>
      {error ? <div className="status error">{error}</div> : null}
      {showSetupLink ? (
        <p className="muted">
          No admin account found yet. <a href="/setup-admin">Create the first admin</a>.
        </p>
      ) : null}
    </form>
  );
}
