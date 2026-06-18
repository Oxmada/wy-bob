'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'
import '../page.css'
import './contact.css'

export default function Contact() {
  const { t } = useLanguage()

  return (
    <div className="container">

      <Navbar />

      <div className="contactZone">
        <div className="contactInner">

          {/* GAUCHE — Formulaire */}
          <div className="contactBloc">
            <h1 className="contactTitre">{t.contact.title}</h1>
            <div className="contactRow">
              <input
                className="contactInput"
                type="text"
                placeholder={t.contact.name}
              />
              <input
                className="contactInput"
                type="email"
                placeholder={t.contact.email}
              />
            </div>
            <input
              className="contactInput"
              type="tel"
              placeholder={t.contact.phone}
            />
            <textarea
              className="contactTextarea"
              placeholder={t.contact.message}
            />
            <button className="contactBtn">{t.contact.send}</button>
          </div>

          {/* DROITE — Image */}
          <div className="contactImage">
            <Image
              src="https://res.cloudinary.com/dnm9txjhm/image/upload/q_auto/f_auto/v1780486949/wybov-portee-bob-noir-crochet-lookbook_ybglrr.jpg"
              alt="Contact WYBOB"
              fill
              sizes="(max-width: 767px) 100vw, 50vw"
              style={{ objectFit: 'cover' }}
            />
          </div>

        </div>
      </div>

      <Footer />

    </div>
  )
}
