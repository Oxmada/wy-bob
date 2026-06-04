'use client'
import Link from 'next/link'
import Image from 'next/image'
import { signOut } from 'next-auth/react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function DashboardHeader({ showLogout = false }: { showLogout?: boolean }) {
  const { locale, t, toggleLocale } = useLanguage()

  const links = [
    { label: t.nav.home, href: '/' },
    { label: t.nav.histoire, href: '/histoire' },
    { label: t.nav.galerie, href: '/galerie' },
    { label: t.nav.contact, href: '/contact' },
  ]

  return (
    <header className="db-header">
      <Link href="/" className="db-header-logo">
        <Image
          src="/images/logo.png"
          alt="WYBOB Logo"
          width={38}
          height={38}
          style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
        />
      </Link>
      <nav className="db-header-links">
        {links.map(link => (
          <Link key={link.href} href={link.href} className="db-header-link">
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="db-header-actions">
        <button className="db-header-lang" onClick={toggleLocale} aria-label="Switch language">
          {locale === 'fr' ? 'EN' : 'FR'}
        </button>
        {showLogout && (
          <button
            className="db-header-logout"
            onClick={() => signOut({ callbackUrl: window.location.origin + '/auth/login' })}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {t.dashboard.sidebar.logout}
          </button>
        )}
      </div>
    </header>
  )
}
