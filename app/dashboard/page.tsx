import { AdminNav } from '@/app/ui/admin-nav';
import { requireAdminSession } from '@/lib/auth';
import { listBookings, getBarbers } from '@/lib/supabase';
import { BookingStatusActions } from '../ui/booking-status-actions';

export default async function DashboardPage() {
  requireAdminSession();
  const [barbers, bookings] = await Promise.all([getBarbers(), listBookings()]);
  const pending = bookings.filter((booking) => booking.status === 'pending').length;
  const completed = bookings.filter((booking) => booking.status === 'completed').length;
  const cancelled = bookings.filter((booking) => booking.status === 'cancelled').length;

  return (
    <main className="dashboard">
      <div className="shell">
        <div className="dashboard-head">
          <div>
            <p className="brand">Kinyozi Pro Dashboard</p>
            <h1>Daily bookings at a glance.</h1>
            <p className="lead">
              Manage appointment status, confirm schedules, and keep track of current
              demand across your team.
            </p>
          </div>
          <div className="pill">{barbers.length} barber(s) configured</div>
        </div>

        <AdminNav />

        <section className="stats">
          <article className="status-card">
            <span className="muted">Pending</span>
            <strong>{pending}</strong>
          </article>
          <article className="status-card">
            <span className="muted">Completed</span>
            <strong>{completed}</strong>
          </article>
          <article className="status-card">
            <span className="muted">Cancelled</span>
            <strong>{cancelled}</strong>
          </article>
        </section>

        <section className="panel">
          <h2>Booking history</h2>
          <p className="muted">
            Review the full appointment log, including customer details, status, and time.
          </p>
          {bookings.length === 0 ? (
            <div className="empty-state">
              <strong>No bookings yet.</strong>
              <p className="muted">
                Add barbers in Supabase, then customers can begin booking.
              </p>
            </div>
          ) : (
            <div className="history-table-wrap">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Barber</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.customer_name}</td>
                      <td>{booking.barber_name ?? booking.barber_id}</td>
                      <td>{booking.service}</td>
                      <td>{booking.day}</td>
                      <td>{booking.time_slot}</td>
                      <td>{booking.end_time}</td>
                      <td>{booking.customer_phone}</td>
                      <td>
                        <span className="pill">{booking.status}</span>
                      </td>
                      <td>
                        {new Date(booking.created_at).toLocaleString('en-KE', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td>
                        <BookingStatusActions
                          bookingId={booking.id}
                          currentStatus={booking.status}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
