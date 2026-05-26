'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useCart } from '@/components/panier-context'
import './page.css'

/* ===== DONNÉES DU PRODUIT ===== */
const product = {
  name: "WYBOB Essentials",
  price: 85,
  rating: 4.8,
  reviews: 12,
  description: "Pensé pour les journées lumineuses et les escapades d'été, le WYBOB Soleil apporte une élégance naturelle à toutes vos silhouettes.",
  colors: [
    { id: 1, name: "Vert",   code: "#2d5a27", image: "/images/hat-vert.png"   },
    { id: 2, name: "Blanc",  code: "#f5f5f0", image: "/images/Blanc.png"      },
    { id: 3, name: "Jaune",  code: "#e6a817", image: "/images/hat-jaune.png"  },
    { id: 4, name: "Marron", code: "#8B4513", image: "/images/hat-marron.png" },
  ]
}

export default function Home() {
  const [selectedColor, setSelectedColor] = useState(2)
  const [hatImage, setHatImage] = useState('/images/Blanc.png')
  const [selectedColorName, setSelectedColorName] = useState('Blanc')
  const { addToCart } = useCart()
  const router = useRouter()

  const handleColorChange = (id: number, image: string, name: string) => {
    setSelectedColor(id)
    setHatImage(image)
    setSelectedColorName(name)
  }

  const handleCommander = () => {
    addToCart({
      _id: 'wybob-' + selectedColorName,
      name: product.name,
      price: product.price,
      image: hatImage,
      color: selectedColorName,
    })
    router.push('/panier')
  }

  return (
    <div className="container">
      <Navbar />

      <div className="mainZone desktopOnly">

        {/* GAUCHE */}
        <div className="leftCol">
          <p className="colorTitle">Choisis ta couleur !</p>
          <div className="swatches">
            {product.colors.map((color) => (
              <div
                key={color.id}
                className={`swatch ${selectedColor === color.id ? 'active' : ''}`}
                style={{ backgroundColor: color.code }}
                onClick={() => handleColorChange(color.id, color.image, color.name)}
              />
            ))}
          </div>
        </div>

        {/* CENTRE */}
        <div className="centerCol">
          <Image
            src={hatImage}
            alt="Chapeau WYBOB"
            width={485}
            height={250}
            style={{ objectFit: 'contain' }}
          />
          <button className="commanderBtn" onClick={handleCommander}>
            COMMANDER
          </button>
        </div>

        {/* DROITE */}
        <div className="rightCol">
          <div className="productCard">
            <h2 className="productName">{product.name}</h2>
            <p className="productRating">⭐⭐⭐⭐⭐ ({product.rating}/5 - {product.reviews} avis)</p>
            <p className="productDesc">{product.description}</p>
            <hr className="productDivider"/>
            <p className="productFeature">Caractéristiques +</p>
            <p className="productFeature">Entretien et lavage +</p>
            <hr className="productDivider"/>
            <p className="productPrice">{product.price}€</p>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  )
}