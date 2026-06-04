import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Notre Galerie — WYBOB',
  description: 'Découvrez la galerie photos WYBOB : chapeaux et bérets artisanaux capturés sous leur meilleur jour.',
}

export default function GalerieLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
