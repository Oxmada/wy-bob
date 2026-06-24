'use client'
import { useLanguage } from '@/contexts/LanguageContext'

export default function DashboardFooter() {
  const { t } = useLanguage()

  return (
    <footer className="db-footer">
      <div className="db-footer-left">
        <span>© 2026, Wybob</span>
        <a href="/mentions-legales">{t.footer.legal}</a>
        <a href="/cgv">{t.footer.cgv}</a>
        <a href="/politique-confidentialite">{t.footer.privacy}</a>
        <span>{t.footer.madeByPrefix}<a href="https://oxmad-digital.mg" rel="nofollow" target="_blank">Oxmad-Digital</a></span>
      </div>
      <div className="db-footer-right">
        <a href="#" aria-label="Instagram">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth="2"/>
            <circle cx="12" cy="12" r="4" strokeWidth="2"/>
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" strokeWidth="0"/>
          </svg>
        </a>
        <a href="#" aria-label="Facebook">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
          </svg>
        </a>
      </div>
    </footer>
  )
}
