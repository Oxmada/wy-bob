'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
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
  const totalArticles = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems]
  )

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

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

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
        onClick={() => setMenuOpen(true)}
        aria-label="Ouvrir le menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="#1B1843" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Menu mobile plein écran */}
      {menuOpen && (
        <div className="mobileMenu">

          {/* Header : logo + bouton fermer */}
          <div className="mobileMenuHeader">
            <Link href="/" className="mobileMenuLogo" onClick={() => setMenuOpen(false)}>
              <Image
                src="/images/logo.png"
                alt="WYBOB Logo"
                width={56}
                height={56}
                style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
              />
            </Link>
            <button className="mobileCloseBtn" onClick={() => setMenuOpen(false)} aria-label="Fermer le menu">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Liens de navigation */}
          <nav className="mobileNavLinks">
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
          </nav>

          {/* Séparateur */}
          <div className="mobileSeparator" />

          {/* Actions secondaires */}
          <div className="mobileActions">
            <Link href="/panier" className="mobileActionLink" onClick={() => setMenuOpen(false)}>
              🛒 {t.nav.panier}{totalArticles > 0 && ` (${totalArticles})`}
            </Link>
            {session ? (
              <>
                <Link href="/dashboard" className="mobileActionLink" onClick={() => setMenuOpen(false)}>
                  👤 {t.nav.dashboard}
                </Link>
                <button className="mobileActionLink" onClick={() => { setMenuOpen(false); signOut({ redirect: false }).then(() => router.push('/')) }}>
                  {t.nav.logout}
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="mobileActionLink" onClick={() => setMenuOpen(false)}>
                  👤 {t.nav.login}
                </Link>
                <Link href="/auth/register" className="mobileActionLink" onClick={() => setMenuOpen(false)}>
                  {t.nav.register}
                </Link>
              </>
            )}
            <button className="mobileLangBtn" onClick={() => { toggleLocale(); setMenuOpen(false) }}>
              {locale === 'fr' ? '🇬🇧 English' : '🇫🇷 Français'}
            </button>
          </div>

        </div>
      )}

    </nav>
  )
}
