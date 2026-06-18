'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'
import '../page.css'
import './histoire.css'

export default function Histoire() {
  const { t } = useLanguage()

  return (
    <div className="container">

      <Navbar />

      <div className="histoireZone">

        {/* GAUCHE — Bloc texte */}
        <div className="histoireBloc">
          <h1 className="histoireTitre">{t.histoire.title}</h1>
          <div className="histoireTexte">
            <p>{t.histoire.p1}</p>
          </div>
        </div>

        {/* DROITE — Image */}
        <div className="histoireImage">
          <Image
            src="https://res.cloudinary.com/dnm9txjhm/image/upload/q_auto/f_auto/v1780486948/wybob-crochet-coloris-caisses-bois_o37ahs.jpg"
            alt="Notre histoire"
            width={451}
            height={457}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        </div>

      </div>
      <Footer />
    </div>
  )
}
