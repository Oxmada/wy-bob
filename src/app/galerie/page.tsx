'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import '../page.css'
import './galerie.css'

const CDN = 'https://res.cloudinary.com/dnm9txjhm/image/upload/q_auto/f_auto'

const pages = [
  {
    rangee1: [
      `${CDN}/v1780172698/galerie1_rteglh.png`,
      `${CDN}/v1780172690/galerie2_j2flds.png`,
      `${CDN}/v1780172698/galerie3_klz7l1.png`,
    ],
    rangee2: [
      `${CDN}/v1780172701/galerie4_btnizk.png`,
      `${CDN}/v1780172704/galerie5_gtu3ev.png`,
      `${CDN}/v1780172702/galerie6_ifyxre.png`,
    ],
  },
  {
    rangee1: [
      `${CDN}/v1780172702/galerie7_ykaezz.jpg`,
      `${CDN}/v1780172702/galerie8_p1tkbd.jpg`,
      `${CDN}/v1780172704/galerie9_i9yb2z.jpg`,
    ],
    rangee2: [
      `${CDN}/v1780172706/galerie10_sz9jal.jpg`,
      `${CDN}/v1780172707/galerie11_trkyb1.jpg`,
      `${CDN}/v1780172688/galerie12_tmuf0c.jpg`,
    ],
  },
]

export default function Galerie() {
  const [currentPage, setCurrentPage] = useState(0)

  const goNext = () => setCurrentPage((p) => (p + 1) % pages.length)
  const goPrev = () => setCurrentPage((p) => (p - 1 + pages.length) % pages.length)

  const page = pages[currentPage]

  return (
    <div className="container">
      <Navbar />

      <div className="galerieZone">

        {/* Rangée 1 */}
        <div className="galerieRangee rangee1">
          <div className="galeriePhoto photo1">
            <img src={page.rangee1[0]} alt="Galerie" />
          </div>
          <div className="galeriePhoto photo2">
            <img src={page.rangee1[1]} alt="Galerie" />
          </div>
          <div className="galeriePhoto photo3 desktop-only">
            <img src={page.rangee1[2]} alt="Galerie" />
          </div>
        </div>

        {/* Rangée 2 */}
        <div className="galerieRangee rangee2">
          <div className="galeriePhoto photo3-bis tablet-only">
            <img src={page.rangee1[2]} alt="Galerie" />
          </div>
          <div className="galeriePhoto photo4">
            <img src={page.rangee2[0]} alt="Galerie" />
          </div>
          <div className="galeriePhoto photo5 desktop-only">
            <img src={page.rangee2[1]} alt="Galerie" />
          </div>
          <div className="galeriePhoto photo6 desktop-only">
            <img src={page.rangee2[2]} alt="Galerie" />
          </div>
        </div>

        {/* Pagination */}
        <div className="galeriePagination">
          <div className="galerieDots">
            {pages.map((_, i) => (
              <div
                key={i}
                className={`galerieDot ${currentPage === i ? 'active' : ''}`}
                onClick={() => setCurrentPage(i)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
          <div className="galerieNav">
            <button className="galerieNavBtn" onClick={goPrev}>
              <img src={`${CDN}/v1780172685/chevron_left_qr2oga.png`} alt="gauche" width={24} height={24} />
            </button>
            <button className="galerieNavBtn" onClick={goNext}>
              <img src={`${CDN}/v1780172686/chevron_right_vlhter.png`} alt="droite" width={24} height={24} />
            </button>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  )
}