import Link from 'next/link';
import { LogoutButton } from './logout-button';

export function BarberNav() {
  return (
    <nav className="admin-nav">
      <Link className="pill" href="/barber">
        My clients
      </Link>
      <LogoutButton />
    </nav>
  );
}
