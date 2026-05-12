import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import '../page.css'
import './galerie.css'

export default function Galerie() {
  return (
    <div className="container">

      <Navbar />

      <div className="galerieZone">

        {/* Rangée haut */}
        <div className="galerieRangee">
          <div className="galeriePhoto photo1">
            <img src="/images/galerie1.png" alt="Galerie 1" />
          </div>
          <div className="galeriePhoto photo2">
            <img src="/images/galerie2.png" alt="Galerie 2" />
          </div>
          <div className="galeriePhoto photo3">
            <img src="/images/galerie3.png" alt="Galerie 3" />
          </div>
        </div>

        {/* Rangée bas */}
        <div className="galerieRangee">
          <div className="galeriePhoto photo4">
            <img src="/images/galerie4.png" alt="Galerie 4" />
          </div>
          <div className="galeriePhoto photo5">
            <img src="/images/galerie5.png" alt="Galerie 5" />
          </div>
          <div className="galeriePhoto photo6">
            <img src="/images/galerie6.png" alt="Galerie 6" />
          </div>
        </div>

       {/* Pagination */}
{/* Pagination */}
<div className="galeriePagination">
  <div className="galerieDots">
    <div className="galerieDot active"/>
    <div className="galerieDot"/>
    <div className="galerieDot"/>
  </div>
  <div className="galerieNav">
    <button className="galerieNavBtn">
      <img src="/images/chevron left.png" alt="gauche" width={24} height={24} />
    </button>
    <button className="galerieNavBtn">
      <img src="/images/chevron right.png" alt="droite" width={24} height={24} />
    </button>
  </div>
</div>
      </div>

      <Footer />

    </div>
  )
}