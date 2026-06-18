import type { Metadata } from 'next'
import { DM_Sans, Quicksand } from 'next/font/google'
import { CartProvider } from '@/components/panier-context'
import SessionWrapper from '@/components/SessionWrapper'
import { LanguageProvider } from '@/contexts/LanguageContext'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-quicksand',
  display: 'swap',
})

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
    <html lang="fr" className={`${dmSans.variable} ${quicksand.variable}`}>
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