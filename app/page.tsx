import Link from 'next/link';
import { BookingForm } from './ui/booking-form';
import { getBarbers } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

export default async function HomePage() {
  const barbers = await getBarbers();
  const session = getSessionUser();
  const isAdmin = session?.role === 'admin';

  return (
    <main className="hero">
      <div className="shell hero-grid">
        <section className="hero-card">
          <div className="brand">
            <span>Kinyozi Pro</span>
            <span>Appointments</span>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <Link className="pill" href="/login">
              Barber login
            </Link>
          </div>
          <h1>Sharper booking for a modern barber shop.</h1>
          <p className="lead">
            Book your next appointment in a few simple steps and get confirmed quickly.
          </p>
          <div className="hero-points">
            <span>Easy appointment booking</span>
            <span>Quick confirmation</span>
            <span>Available barber matching</span>
          </div>
        </section>

        <section className="panel">
          <h2>Book an appointment</h2>
          <p className="muted">
            Fill in your details below to reserve a time. If your chosen barber is busy,
            we can assign the next available barber so you do not miss your slot.
          </p>
          <BookingForm barbers={barbers} />
        </section>
      </div>

      <div className="shell" style={{ paddingBottom: '3rem' }}>
        <section className="panel">
          <h2>Why clients love it</h2>
          <div className="info-list">
            <div>
              <strong>Fast booking</strong>
              <p className="muted">
                Reserve your haircut or shave in a few quick steps without calling first.
              </p>
            </div>
            <div>
              <strong>Less waiting</strong>
              <p className="muted">
                If one barber is occupied, your appointment can be matched to another available barber.
              </p>
            </div>
            {isAdmin ? (
              <div>
                <strong>Manager view</strong>
                <p className="muted">
                  Track booking status from the dashboard and keep the day moving smoothly.
                  <Link href="/dashboard" style={{ marginLeft: '0.45rem', fontWeight: 700 }}>
                    Open dashboard
                  </Link>
                </p>
              </div>
            ) : null}
            {isAdmin ? (
              <div>
                <strong>In-app setup tools</strong>
                <p className="muted">
                  Add barbers and manage daily availability without leaving the application.
                  <Link href="/dashboard/barbers" style={{ marginLeft: '0.45rem', fontWeight: 700 }}>
                    Manage team
                  </Link>
                </p>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
