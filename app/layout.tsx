import Link from 'next/link';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kinyozi Pro',
  description: 'Professional barber booking and team management.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="shell site-header-inner">
            <Link className="brand site-brand" href="/">
              <span>Kinyozi Pro</span>
              <span>Appointments</span>
            </Link>
            <nav className="site-links">
              <Link className="pill" href="/">
                Home
              </Link>
              <Link className="pill" href="/login">
                Team login
              </Link>
            </nav>
          </div>
        </header>
        <div className="site-main">{children}</div>
      </body>
    </html>
  );
}
