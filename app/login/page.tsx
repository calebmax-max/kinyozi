import { redirect } from 'next/navigation';
import { LoginForm } from '@/app/ui/login-form';
import { countAdmins } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

export default async function LoginPage() {
  const session = getSessionUser();

  if (session) {
    redirect(session.role === 'admin' ? '/dashboard' : '/barber');
  }

  let showSetupLink = false;

  try {
    showSetupLink = (await countAdmins()) === 0;
  } catch {
    showSetupLink = false;
  }

  return (
    <main className="hero">
      <div className="shell">
        <section className="panel auth-panel auth-panel-centered">
          <p className="brand">Kinyozi Pro Access</p>
          <h1>Team sign in.</h1>
          <p className="lead">
            Admins can manage the whole team. Barbers can sign in to see their own clients.
          </p>
          <LoginForm showSetupLink={showSetupLink} />
        </section>
      </div>
    </main>
  );
}
