import type { Metadata } from 'next'
import { CartProvider } from '@/components/panier-context'
import SessionWrapper from '@/components/SessionWrapper'
import { LanguageProvider } from '@/contexts/LanguageContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'WYBOB',
  description: 'Chapeaux premium WYBOB',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <SessionWrapper>
          <LanguageProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </LanguageProvider>
        </SessionWrapper>
      </body>
    </html>
  )
}