'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useCart } from '@/components/panier-context'
import { useLanguage } from '@/contexts/LanguageContext'
import './page.css'

const productColors = [
  { id: 1, key: 'Blue',   code: "#1B2D5E", textColor: "#ffffff", image: "/images/wybob_bleu.webp"  },
  { id: 2, key: 'White',  code: "#f5f5f0", textColor: "#1B1843", image: "/images/wybob_blanc.webp" },
  { id: 3, key: 'Yellow', code: "#e6a817", textColor: "#1B1843", image: "/images/wybob_jaune.webp" },
  { id: 4, key: 'Red',    code: "#c0392b", textColor: "#ffffff", image: "/images/wybob_rouge.webp" },
]

const productName = "WYBOB Essentials"
const productPrice = 85
const productRating = 4.8
const productReviews = 12

export default function Home() {
  const [selectedColor, setSelectedColor] = useState(productColors[0].id)
  const [hatImage, setHatImage] = useState(productColors[0].image)
  const [selectedColorKey, setSelectedColorKey] = useState<'Blue'|'White'|'Yellow'|'Red'>(productColors[0].key as 'Blue')
  const [selectedColorCode, setSelectedColorCode] = useState(productColors[0].code)
  const [selectedTextColor, setSelectedTextColor] = useState(productColors[0].textColor)
  const [openSection, setOpenSection] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isFading, setIsFading] = useState(false)
  const { addToCart } = useCart()
  const { t } = useLanguage()
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el || window.innerWidth < 768) return
    el.style.maxHeight = el.getBoundingClientRect().height + 'px'
  }, [])

  const toggleSection = (section: string) => {
    setOpenSection(prev => prev === section ? null : section)
  }

  const handleColorChange = (id: number, image: string, key: string, code: string, textColor: string) => {
    setIsFading(true)
    setTimeout(() => {
      setSelectedColor(id)
      setHatImage(image)
      setSelectedColorKey(key as 'Blue'|'White'|'Yellow'|'Red')
      setSelectedColorCode(code)
      setSelectedTextColor(textColor)
      setIsFading(false)
    }, 150)
  }

  const handleCommander = () => {
    const colorName = t.home.colors[selectedColorKey]
    addToCart({
      _id: 'wybob-' + selectedColorKey,
      name: productName,
      price: productPrice,
      image: hatImage,
      color: colorName,
    }, quantity)
    router.push('/panier')
  }

  return (
    <div className="container">
      <Navbar />

      <div className="mainZone">

        {/* GAUCHE — image */}
        <div className="imageCol">
          <img
            src={hatImage}
            alt="Chapeau WYBOB"
            className={`hatImage${isFading ? ' fading' : ''}`}
          />
        </div>

        {/* DROITE — fiche produit */}
        <div className="contentCol">
        <div className="contentScrollInner" ref={scrollRef}>

          {/* Nom */}
          <h2 className="productName">{productName}</h2>

          {/* Note */}
          <div className="ratingRow">
            <span className="ratingStars">★★★★★</span>
            <span className="ratingScore">({productRating})</span>
          </div>

          {/* Prix */}
          <p className="priceTag">{productPrice}€</p>

          {/* Description */}
          <div className="productFeature" onClick={() => toggleSection('description')}>
            <span>{t.home.sectionDescription}</span>
            <span className={`featureToggle ${openSection === 'description' ? 'open' : ''}`}>+</span>
          </div>
          {openSection === 'description' && (
            <p className="productDesc">{t.home.description}</p>
          )}

          <hr className="productDivider" />

          {/* Couleur */}
          <div className="productFeature" onClick={() => toggleSection('color')}>
            <span>{t.home.colorLabel} <span className="colorNameInline">{t.home.colors[selectedColorKey]}</span></span>
            <span className={`featureToggle ${openSection === 'color' ? 'open' : ''}`}>+</span>
          </div>
          {openSection === 'color' && (
            <div className="swatches">
              {productColors.map((color) => (
                <button
                  key={color.id}
                  className={`swatchDot ${selectedColor === color.id ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); handleColorChange(color.id, color.image, color.key, color.code, color.textColor); }}
                  aria-label={t.home.colors[color.key as 'Blue'|'White'|'Yellow'|'Red']}
                  style={{
                    backgroundColor: color.code,
                    boxShadow: selectedColor === color.id
                      ? `0 0 0 1.5px rgba(255,255,255,0.9), 0 0 0 3.5px ${color.code}`
                      : '0 2px 6px rgba(0,0,0,0.18)'
                  }}
                />
              ))}
            </div>
          )}

          <hr className="productDivider" />

          <div className="productFeature" onClick={() => toggleSection('features')}>
            <span>{t.home.sectionFeatures}</span>
            <span className={`featureToggle ${openSection === 'features' ? 'open' : ''}`}>+</span>
          </div>
          {openSection === 'features' && (
            <ul className="featureList">
              {t.home.features.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          )}

          <hr className="productDivider" />

          <div className="productFeature" onClick={() => toggleSection('care')}>
            <span>{t.home.sectionCare}</span>
            <span className={`featureToggle ${openSection === 'care' ? 'open' : ''}`}>+</span>
          </div>
          {openSection === 'care' && (
            <ul className="featureList">
              {t.home.care.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          )}

          <div className="ctaRow">
          <div className="quantitySelector">
            <button className="qtyBtn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
            <span className="qtyValue">{quantity}</span>
            <button className="qtyBtn" onClick={() => setQuantity(q => q + 1)}>+</button>
          </div>
          <button
            className="commanderBtn"
            onClick={handleCommander}
            style={{ backgroundColor: selectedColorCode, color: selectedTextColor }}
          >{t.home.order}</button>
          </div>

        </div>

        </div>

      </div>

      <Footer />
    </div>
  )
}
