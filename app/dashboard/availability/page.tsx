import { AdminNav } from '@/app/ui/admin-nav';
import { AvailabilityManager } from '@/app/ui/availability-manager';
import { requireAdminSession } from '@/lib/auth';
import { getBarbers } from '@/lib/supabase';

export default async function AvailabilityPage() {
  requireAdminSession();
  const barbers = await getBarbers();

  return (
    <main className="dashboard">
      <div className="shell">
        <div className="dashboard-head">
          <div>
            <p className="brand">Kinyozi Pro Admin</p>
            <h1>Availability management.</h1>
            <p className="lead">
              Control which time slots each barber can be booked for, directly from the app.
            </p>
          </div>
        </div>

        <AdminNav />
        <AvailabilityManager barbers={barbers} />
      </div>
    </main>
  );
}
