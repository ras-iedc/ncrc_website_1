'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/AuthProvider';
import { useState } from 'react';

export default function Navbar() {
  const { user, status, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = user?.role === 'ADMIN';
  const isAuthenticated = status === 'authenticated';

  return (
    <nav className="border-b-2 border-ink-900 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="NCRC" width={40} height={40} className="rounded-full" />
            <span className="font-display text-lg font-bold tracking-tight hidden sm:block">NCRC</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/posts">News</NavLink>
            <NavLink href="/shop">Shop</NavLink>
            {isAuthenticated ? (
              <>
                <NavLink href="/dashboard">Dashboard</NavLink>
                {isAdmin && <NavLink href="/admin/members">Admin</NavLink>}
                <button
                  onClick={() => signOut()}
                  className="ml-2 neo-btn neo-btn-secondary text-sm py-1.5 px-4"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="ml-2 neo-btn neo-btn-secondary text-sm py-1.5 px-4">Sign In</Link>
                <Link href="/register" className="neo-btn neo-btn-primary text-sm py-1.5 px-4">Register</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 border-2 border-ink-900"
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t-2 border-ink-900 py-3 space-y-1">
            <MobileLink href="/" onClick={() => setMenuOpen(false)}>Home</MobileLink>
            <MobileLink href="/posts" onClick={() => setMenuOpen(false)}>News</MobileLink>
            <MobileLink href="/shop" onClick={() => setMenuOpen(false)}>Shop</MobileLink>
            {isAuthenticated ? (
              <>
                <MobileLink href="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</MobileLink>
                {isAdmin && <MobileLink href="/admin/members" onClick={() => setMenuOpen(false)}>Admin</MobileLink>}
                <button
                  onClick={() => { setMenuOpen(false); signOut(); }}
                  className="block w-full text-left px-3 py-2 text-sm font-medium text-accent hover:bg-cream-100"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <MobileLink href="/login" onClick={() => setMenuOpen(false)}>Sign In</MobileLink>
                <MobileLink href="/register" onClick={() => setMenuOpen(false)}>Register</MobileLink>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="px-3 py-2 text-sm font-medium text-ink-700 hover:text-accent transition-colors">
      {children}
    </Link>
  );
}

function MobileLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link href={href} onClick={onClick} className="block px-3 py-2 text-sm font-medium text-ink-700 hover:bg-cream-100">
      {children}
    </Link>
  );
}
