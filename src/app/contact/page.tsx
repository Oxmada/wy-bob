import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import '../page.css'
import './contact.css'

export default function Contact() {
  return (
    <div className="container">

      <Navbar />

      <div className="contactZone">
        <div className="contactInner">

          {/* GAUCHE — Formulaire */}
          <div className="contactBloc">
            <h1 className="contactTitre">Contacts</h1>
            <input
              className="contactInput"
              type="text"
              placeholder="Nom complet"
            />
            <input
              className="contactInput"
              type="email"
              placeholder="Adresse email"
            />
            <input
              className="contactInput"
              type="tel"
              placeholder="Numéro de téléphone (optionnel)"
            />
            <textarea
              className="contactTextarea"
              placeholder="Message"
            />
            <button className="contactBtn">ENVOYER</button>
          </div>

          {/* DROITE — Image */}
          <div className="contactImage">
            <Image
              src="/images/contact.png"
              alt="Contact WYBOB"
              width={456}
              height={431}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          </div>

        </div>
      </div>

      <Footer />

    </div>
  )
}