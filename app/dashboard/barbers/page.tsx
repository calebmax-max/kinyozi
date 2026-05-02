import { AdminNav } from '@/app/ui/admin-nav';
import { BarberLoginLinkForm } from '@/app/ui/barber-login-link-form';
import { BarberCreateForm } from '@/app/ui/barber-create-form';
import { getBarbers } from '@/lib/supabase';
import { requireAdminSession } from '@/lib/auth';

export default async function BarbersPage() {
  requireAdminSession();
  const barbers = await getBarbers();

  return (
    <main className="dashboard">
      <div className="shell">
        <div className="dashboard-head">
          <div>
            <p className="brand">Kinyozi Pro Admin</p>
            <h1>Barber management.</h1>
            <p className="lead">
              Add team members directly from the app and keep shop details organized.
            </p>
          </div>
        </div>

        <AdminNav />

        <div className="admin-grid">
          <section className="panel">
            <h2>Add a barber</h2>
            <p className="muted">
              Create a barber profile with a login so each team member can view their own clients.
            </p>
            <BarberCreateForm />
            <div className="divider" />
            <h2>Attach login to existing barber</h2>
            <p className="muted">
              Use this if a barber record already exists but still needs sign-in access.
            </p>
            <BarberLoginLinkForm barbers={barbers} />
          </section>

          <section className="panel">
            <h2>Current barbers</h2>
            {barbers.length === 0 ? (
              <div className="empty-state">No barbers configured yet.</div>
            ) : (
              <div className="history-table-wrap">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Shop</th>
                      <th>Login email</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {barbers.map((barber) => (
                      <tr key={barber.id}>
                        <td>{barber.name}</td>
                        <td>{barber.phone}</td>
                        <td>{barber.shop_name}</td>
                        <td>{barber.email ?? 'No login yet'}</td>
                        <td>
                          {new Date(barber.created_at).toLocaleString('en-KE', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
