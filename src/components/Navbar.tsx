'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useCart } from '@/components/panier-context'
import { useLanguage } from '@/contexts/LanguageContext'
import './Navbar.css'

export default function Navbar() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const { cartItems } = useCart()
  const { t, locale, toggleLocale } = useLanguage()
  const { data: session } = useSession()
  const totalArticles = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  const links = [
    { label: t.nav.home, href: '/' },
    { label: t.nav.histoire, href: '/histoire' },
    { label: t.nav.galerie, href: '/galerie' },
    { label: t.nav.contact, href: '/contact' },
  ]

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!profileRef.current?.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <nav className="navbar">

      {/* Logo */}
      <Link href="/" className="navLogo">
        <Image
          src="/images/logo.png"
          alt="WYBOB Logo"
          width={80}
          height={80}
          style={{ objectFit: 'contain' }}
        />
      </Link>

      {/* Liens desktop */}
      <div className="links">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="link">
            {link.label}
          </Link>
        ))}
      </div>

      {/* Icônes desktop */}
      <div className="icons">

        {/* Sélecteur de langue */}
        <button className="langBtn" onClick={toggleLocale} aria-label="Switch language">
          {locale === 'fr' ? 'EN' : 'FR'}
        </button>

        {/* Panier */}
        <Link href="/panier" className="iconBtn panierIcon">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#1B1843' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          {totalArticles > 0 && (
            <span className="panierBadge">{totalArticles}</span>
          )}
        </Link>

        {/* Profil avec menu déroulant */}
        <div className="profileWrapper" ref={profileRef}>
          <button className="iconBtn" onClick={() => setProfileOpen(!profileOpen)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#1B1843' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>

          {profileOpen && (
            <div className="profileMenu">
              {session ? (
                <>
                  <Link href="/dashboard" onClick={() => setProfileOpen(false)}>
                    {t.nav.dashboard}
                  </Link>
                  <button onClick={() => { setProfileOpen(false); signOut({ redirect: false }).then(() => router.push('/')) }}>
                    {t.nav.logout}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setProfileOpen(false)}>
                    {t.nav.login}
                  </Link>
                  <Link href="/auth/register" onClick={() => setProfileOpen(false)}>
                    {t.nav.register}
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Bouton hamburger */}
      <button
        className="hamburgerBtn"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Menu"
      >
        {menuOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#1B1843" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#1B1843" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="mobileMenu">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="mobileLink"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/panier" className="mobileLink" onClick={() => setMenuOpen(false)}>
            🛒 {t.nav.panier} {totalArticles > 0 && `(${totalArticles})`}
          </Link>
          {session ? (
            <>
              <Link href="/dashboard" className="mobileLink" onClick={() => setMenuOpen(false)}>
                {t.nav.dashboard}
              </Link>
              <button className="mobileLink" onClick={() => { setMenuOpen(false); signOut({ redirect: false }).then(() => router.push('/')) }}>
                {t.nav.logout}
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="mobileLink" onClick={() => setMenuOpen(false)}>
                {t.nav.login}
              </Link>
              <Link href="/auth/register" className="mobileLink" onClick={() => setMenuOpen(false)}>
                {t.nav.register}
              </Link>
            </>
          )}
          <button className="mobileLink mobileLangBtn" onClick={() => { toggleLocale(); setMenuOpen(false) }}>
            {locale === 'fr' ? '🇬🇧 English' : '🇫🇷 Français'}
          </button>
        </div>
      )}

    </nav>
  )
}
