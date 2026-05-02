import { BarberNav } from '@/app/ui/barber-nav';
import { BookingStatusActions } from '@/app/ui/booking-status-actions';
import { listBookings } from '@/lib/supabase';
import { requireBarberSession } from '@/lib/auth';

export default async function BarberPage() {
  const session = requireBarberSession();
  const bookings = await listBookings(session.barber_id ?? undefined);

  return (
    <main className="dashboard">
      <div className="shell">
        <div className="dashboard-head">
          <div>
            <p className="brand">Kinyozi Pro Barber View</p>
            <h1>{session.name}&apos;s clients.</h1>
            <p className="lead">
              Review your appointments, customer details, and service progress.
            </p>
          </div>
        </div>

        <BarberNav />

        <section className="panel">
          <h2>Assigned bookings</h2>
          {bookings.length === 0 ? (
            <div className="empty-state">No clients assigned yet.</div>
          ) : (
            <div className="history-table-wrap">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.customer_name}</td>
                      <td>{booking.service}</td>
                      <td>{booking.day}</td>
                      <td>{booking.time_slot}</td>
                      <td>{booking.end_time}</td>
                      <td>{booking.customer_phone}</td>
                      <td>
                        <span className="pill">{booking.status}</span>
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
