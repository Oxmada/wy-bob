'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useCart } from '@/components/panier-context'

export default function DashboardHeader({ showLogout = false }: { showLogout?: boolean }) {
  const router = useRouter()
  const { locale, t, toggleLocale } = useLanguage()
  const { cartItems } = useCart()
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

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
        <Link href="/panier" className="db-header-cart" aria-label="Panier">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          {cartCount > 0 && <span className="db-header-cart-badge">{cartCount}</span>}
        </Link>
        <button className="db-header-lang" onClick={toggleLocale} aria-label="Switch language">
          {locale === 'fr' ? 'EN' : 'FR'}
        </button>
        {showLogout && (
          <button
            className="db-header-logout"
            onClick={() => signOut({ redirect: false }).then(() => router.push('/auth/login'))}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span className="db-header-logout-label">{t.dashboard.sidebar.logout}</span>
          </button>
        )}
      </div>
    </header>
  )
}
