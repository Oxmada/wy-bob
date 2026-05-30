'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useCart } from '@/components/panier-context'
import './page.css'

const product = {
  name: "WYBOB Essentials",
  price: 85,
  rating: 4.8,
  reviews: 12,
  description: "Pensé pour les journées lumineuses et les escapades d'été, le WYBOB Soleil apporte une élégance naturelle à toutes vos silhouettes.",
  colors: [
    { id: 1, name: "Bleu",   code: "#1a4fa0", image: "/images/wybob_bleu.webp"  },
    { id: 2, name: "Blanc",  code: "#f5f5f0", image: "/images/wybob_blanc.webp" },
    { id: 3, name: "Jaune",  code: "#e6a817", image: "/images/wybob_jaune.webp" },
    { id: 4, name: "Rouge",  code: "#c0392b", image: "/images/wybob_rouge.webp" },
  ]
}

export default function Home() {
  const [selectedColor, setSelectedColor] = useState(product.colors[0].id)
  const [hatImage, setHatImage] = useState(product.colors[0].image)
  const [selectedColorName, setSelectedColorName] = useState(product.colors[0].name)
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

      <div className="mainZone">

        {/* CENTRE — chapeau + bouton */}
        <div className="centerCol">
         <img
  src={hatImage}
  alt="Chapeau WYBOB"
  className="hatImage"
/>
          <button className="commanderBtn" onClick={handleCommander}>
            COMMANDER
          </button>
        </div>

        {/* BOTTOM ROW — gauche + droite */}
        <div className="bottomRow">

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

          {/* DROITE */}
          <div className="rightCol">
            <div className="productCard">
              <h2 className="productName">{product.name}</h2>
              <p className="productRating">⭐⭐⭐⭐⭐ ({product.rating}/5 - {product.reviews} avis)</p>
              <p className="productDesc">{product.description}</p>
              <hr className="productDivider"/>
             <p className="productFeature">
  Caractéristiques 
  <span style={{ float: 'right' }}>+</span>
</p>
<p className="productFeature">
  Entretien et lavage 
  <span style={{ float: 'right' }}>+</span>
</p>
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