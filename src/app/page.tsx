'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useCart } from '@/components/panier-context'
import { useLanguage } from '@/contexts/LanguageContext'
import './page.css'

interface Variant {
  _id: string
  colorName: string
  colorCode: string
  textColor: string
  image: string
}

interface ProductData {
  _id: string
  name: string
  price: number
  pricePromo: number | null
  stock: number
  visible: boolean
  variants: Variant[]
}

const FALLBACK_VARIANTS: Variant[] = [
  { _id: '1', colorName: 'Bleu',  colorCode: '#1B2D5E', textColor: '#ffffff', image: '/images/wybob_bleu.webp'  },
  { _id: '2', colorName: 'Blanc', colorCode: '#f5f5f0', textColor: '#1B1843', image: '/images/wybob_blanc.webp' },
  { _id: '3', colorName: 'Jaune', colorCode: '#e6a817', textColor: '#1B1843', image: '/images/wybob_jaune.webp' },
  { _id: '4', colorName: 'Rouge', colorCode: '#c0392b', textColor: '#ffffff', image: '/images/wybob_rouge.webp' },
]

const productRating  = 4.8
const productReviews = 12

export default function Home() {
  const [product,           setProduct]           = useState<ProductData | null>(null)
  const [selectedVariant,   setSelectedVariant]   = useState<Variant | null>(null)
  const [openSection,       setOpenSection]       = useState<string | null>(null)
  const [quantity,          setQuantity]          = useState(1)
  const [isFading,          setIsFading]          = useState(false)
  const { addToCart } = useCart()
  const { t } = useLanguage()
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/product')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.product) {
          setProduct(data.product)
          setSelectedVariant(data.product.variants?.[0] ?? FALLBACK_VARIANTS[0])
        } else {
          setSelectedVariant(FALLBACK_VARIANTS[0])
        }
      })
      .catch(() => { setSelectedVariant(FALLBACK_VARIANTS[0]) })
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el || window.innerWidth < 768) return
    el.style.maxHeight = el.getBoundingClientRect().height + 'px'
  }, [])

  const variants = product?.variants?.length ? product.variants : FALLBACK_VARIANTS
  const productName  = product?.name  ?? 'WYBOB Essentials'
  const productPrice = product?.pricePromo ?? product?.price ?? 85

  const toggleSection = (section: string) => {
    setOpenSection(prev => prev === section ? null : section)
  }

  const handleVariantChange = (variant: Variant) => {
    setIsFading(true)
    setTimeout(() => {
      setSelectedVariant(variant)
      setIsFading(false)
    }, 150)
  }

  const handleCommander = () => {
    addToCart({
      _id:   'wybob-' + selectedVariant._id,
      name:  productName,
      price: productPrice,
      image: selectedVariant.image,
      color: selectedVariant.colorName,
    }, quantity)
    router.push('/panier')
  }

  return (
    <div className="container">
      <Navbar />

      <div className="mainZone">

        {/* GAUCHE — image */}
        <div className="imageCol">
          {selectedVariant && (
            <img
              src={selectedVariant.image}
              alt="Chapeau WYBOB"
              className={`hatImage${isFading ? ' fading' : ''}`}
            />
          )}
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
          <div className="priceRow">
            {product?.pricePromo ? (
              <>
                <p className="priceTag">{product.pricePromo}€</p>
                <p className="priceOriginal">{product.price}€</p>
              </>
            ) : (
              <p className="priceTag">{product?.price ?? 85}€</p>
            )}
          </div>

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
            <span>{t.home.colorLabel} <span className="colorNameInline">{selectedVariant?.colorName}</span></span>
            <span className={`featureToggle ${openSection === 'color' ? 'open' : ''}`}>+</span>
          </div>
          {openSection === 'color' && (
            <div className="swatches">
              {variants.map((v) => (
                <button
                  key={v._id}
                  className={`swatchDot ${selectedVariant?._id === v._id ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); handleVariantChange(v) }}
                  aria-label={v.colorName}
                  style={{
                    backgroundColor: v.colorCode,
                    boxShadow: selectedVariant?._id === v._id
                      ? `0 0 0 1.5px rgba(255,255,255,0.9), 0 0 0 3.5px ${v.colorCode}`
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
            <button className="qtyBtn" onClick={() => setQuantity(q => Math.max(1, q - 1))} aria-label="Diminuer la quantité">−</button>
            <span className="qtyValue">{quantity}</span>
            <button className="qtyBtn" onClick={() => setQuantity(q => q + 1)} aria-label="Augmenter la quantité">+</button>
          </div>
          <button
            className="commanderBtn"
            onClick={handleCommander}
            style={{ backgroundColor: selectedVariant?.colorCode, color: selectedVariant?.textColor }}
          >{t.home.order}</button>
          </div>

        </div>
        </div>

      </div>

      <Footer />
    </div>
  )
}
