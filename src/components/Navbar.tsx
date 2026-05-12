'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import './Navbar.css'

const links = [
  { label: 'Home', href: '/' },
  { label: 'Notre Histoire', href: '/histoire' },
  { label: 'Le concept', href: '/concept' },
  { label: 'Gallerie', href: '/galerie' },
  { label: 'Contacts', href: '/contact' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

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
        <button className="iconBtn">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#1B1843' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </button>
        <button className="iconBtn">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#1B1843' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </div>

      {/* Bouton hamburger — visible uniquement en mobile */}
      <button
        className="hamburgerBtn"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Menu"
      >
        {menuOpen ? (
          // X pour fermer
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#1B1843" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          // Hamburger
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#1B1843" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Menu mobile déroulant */}
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
        </div>
      )}

    </nav>
  )
}