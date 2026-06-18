'use client'

import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useLanguage } from '@/contexts/LanguageContext'
import '../page.css'
import './galerie.css'

const CDN = 'https://res.cloudinary.com/dnm9txjhm/image/upload/q_auto/f_auto'

const FALLBACK_IMAGES = [
  `${CDN}/v1780486486/wybob_portrait_femme_maillot_noir_chapeau_crochet_blanc_zygujw.jpg`,
  `${CDN}/v1780486485/wybob_portrait_serre_deux_femmes_chapeaux_bikinis_iwlc3v.jpg`,
  `${CDN}/v1780486485/wybob_portrait_femme_souriante_maillot_noir_main_chapeau_eodlwd.jpg`,
  `${CDN}/v1780486484/wybob_deux_femmes_maillots_bikinis_chapeaux_rouges_noirs_kpt1lu.jpg`,
  `${CDN}/v1780486485/wybob_femme_maillot_noir_touche_bois_flotte_v9i1og.jpg`,
  `${CDN}/v1780486484/wybob_deux_femmes_face_sous_hangar_bois_turquoise_exmm9y.jpg`,
  `${CDN}/v1780486485/wybob_trois_femmes_allongees_pont_chapeaux_crochet_rerozt.jpg`,
  `${CDN}/v1780486485/wybob_portrait_deux_femmes_de_bout_sous_hangar_by5fse.jpg`,
  `${CDN}/v1780486484/wybob_portrait_serre_face_deux_femmes_chapeaux_Arrow_oupr9y.jpg`,
]

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

export default function Galerie() {
  const [allImages,     setAllImages]     = useState<string[]>([])
  const [currentPage,   setCurrentPage]   = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const { t } = useLanguage()

  useEffect(() => {
    fetch('/api/gallery')
      .then(r => r.json())
      .then(data => {
        const urls: string[] = (data.photos ?? []).map((p: { url: string }) => p.url)
        setAllImages(urls.length ? urls : FALLBACK_IMAGES)
      })
      .catch(() => setAllImages(FALLBACK_IMAGES))
  }, [])

  const pages  = chunk(allImages, 6)
  const images = pages[currentPage] ?? []

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox   = useCallback(() => setLightboxIndex(null), [])
  const goPrevLightbox  = useCallback(() => setLightboxIndex(i => i !== null ? (i - 1 + images.length) % images.length : null), [images])
  const goNextLightbox  = useCallback(() => setLightboxIndex(i => i !== null ? (i + 1) % images.length : null), [images])

  useEffect(() => {
    if (lightboxIndex === null) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      closeLightbox()
      else if (e.key === 'ArrowLeft')  goPrevLightbox()
      else if (e.key === 'ArrowRight') goNextLightbox()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxIndex, closeLightbox, goPrevLightbox, goNextLightbox])

  const goNext = () => setCurrentPage(p => (p + 1) % Math.max(pages.length, 1))
  const goPrev = () => setCurrentPage(p => (p - 1 + Math.max(pages.length, 1)) % Math.max(pages.length, 1))

  return (
    <div className="container">
      <Navbar />

      <div className="galerieZone">

        {/* Colonne gauche : titre */}
        <div className="galerieTitreCol">
          <div className="galerieTitreContent">
            <h1 className="galerieTitre">{t.galerie.title}</h1>
          </div>
          {/* Pagination desktop uniquement */}
          <div className="galeriePagination galerieDesktopPagination">
            <div className="galerieDots">
              {pages.map((_, i) => (
                <div
                  key={i}
                  className={`galerieDot ${currentPage === i ? 'active' : ''}`}
                  onClick={() => setCurrentPage(i)}
                />
              ))}
            </div>
            <div className="galerieNav">
              <button className="galerieNavBtn" onClick={goPrev} aria-label={t.galerie.prevPage}>
                <img src={`${CDN}/v1780172685/chevron_left_qr2oga.png`} alt="" width={24} height={24} />
              </button>
              <button className="galerieNavBtn" onClick={goNext} aria-label={t.galerie.nextPage}>
                <img src={`${CDN}/v1780172686/chevron_right_vlhter.png`} alt="" width={24} height={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Grille photos */}
        <div
          className="galerieGrid"
          style={{ gridTemplateRows: `repeat(${Math.ceil(images.length / 3)}, 1fr)` }}
        >
          {images.map((src, i) => (
            <div key={i} className="galeriePhoto" onClick={() => openLightbox(i)}>
              <img src={src} alt={`WYBOB — photo ${currentPage * 6 + i + 1}`} />
            </div>
          ))}
        </div>

        {/* Pagination mobile uniquement — sous la grille */}
        <div className="galeriePagination galerieMobilePagination">
          <div className="galerieDots">
            {pages.map((_, i) => (
              <div
                key={i}
                className={`galerieDot ${currentPage === i ? 'active' : ''}`}
                onClick={() => setCurrentPage(i)}
              />
            ))}
          </div>
          <div className="galerieNav">
            <button className="galerieNavBtn" onClick={goPrev} aria-label={t.galerie.prevPage}>
              <img src={`${CDN}/v1780172685/chevron_left_qr2oga.png`} alt="" width={24} height={24} />
            </button>
            <button className="galerieNavBtn" onClick={goNext} aria-label={t.galerie.nextPage}>
              <img src={`${CDN}/v1780172686/chevron_right_vlhter.png`} alt="" width={24} height={24} />
            </button>
          </div>
        </div>

      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="lightboxOverlay" onClick={closeLightbox}>
          <button className="lightboxClose" onClick={closeLightbox} aria-label="Fermer la galerie">×</button>
          <button className="lightboxPrev" onClick={(e) => { e.stopPropagation(); goPrevLightbox() }}>
            <img src={`${CDN}/v1780172685/chevron_left_qr2oga.png`} alt={t.galerie.prev} width={24} height={24} />
          </button>
          <div className="lightboxContent" onClick={(e) => e.stopPropagation()}>
            <img src={images[lightboxIndex]} alt="Photo galerie WYBOB" />
          </div>
          <button className="lightboxNext" onClick={(e) => { e.stopPropagation(); goNextLightbox() }}>
            <img src={`${CDN}/v1780172686/chevron_right_vlhter.png`} alt={t.galerie.next} width={24} height={24} />
          </button>
        </div>
      )}

      <Footer />
    </div>
  )
}
