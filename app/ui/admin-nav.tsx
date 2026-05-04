import Link from 'next/link';
import { LogoutButton } from './logout-button';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/barbers', label: 'Barbers' },
];

export function AdminNav() {
  return (
    <nav className="admin-nav">
      {links.map((link) => (
        <Link className="pill" key={link.href} href={link.href}>
          {link.label}
        </Link>
      ))}
      <LogoutButton />
    </nav>
  );
}
