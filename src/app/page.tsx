'use client'

import { useState } from 'react'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ColorSwatches from '@/components/ColorSwatches'
import { product } from '@/lib/products'
import './page.css'

export default function Home() {
  const [selectedColor, setSelectedColor] = useState(2)
  const [hatImage, setHatImage] = useState('/images/Blanc.png')

  const handleColorChange = (id: number, image: string) => {
    setSelectedColor(id)
    setHatImage(image)
  }

  return (
    <div className="container">

      <Navbar />

      <div className="mainZone">

        {/* LIGNE 1 : Chapeau + Bouton */}
        <div className="centerCol">
          <Image
            src="/images/Blanc.png"
            alt="Chapeau WYBOB"
            width={485}
            height={250}
            style={{ objectFit: 'contain' }}
          />
          <button className="commanderBtn">COMMANDER</button>
        </div>

        {/* LIGNE 2 : Swatches + Carte produit */}
        <div className="bottomRow">

          {/* GAUCHE */}
          <div className="leftCol">
            <ColorSwatches
              selected={selectedColor}
              onChange={handleColorChange}
            />
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

      </div>
      <Footer />
    </div>
  )
}