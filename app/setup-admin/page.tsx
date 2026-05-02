import { redirect } from 'next/navigation';
import { AdminSetupForm } from '@/app/ui/admin-setup-form';
import { countAdmins } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

export default async function SetupAdminPage() {
  const session = getSessionUser();

  if (session?.role === 'admin') {
    redirect('/dashboard');
  }

  const adminCount = await countAdmins();

  if (adminCount > 0) {
    redirect('/login');
  }

  return (
    <main className="dashboard">
      <div className="shell auth-shell">
        <section className="panel auth-panel">
          <p className="brand">Kinyozi Pro Setup</p>
          <h1>Create the first admin.</h1>
          <p className="lead">
            This account manages the team, creates barber logins, and reviews shop activity.
          </p>
          <AdminSetupForm />
        </section>
      </div>
    </main>
  );
}
