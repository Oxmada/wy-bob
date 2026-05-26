'use client'

interface Color {
  id: number
  name: string
  code: string
  image: string
}

interface Props {
  colors: Color[]
  selected: number
  onChange: (id: number, image: string, name: string) => void
}

export default function ColorSwatches({ colors, selected, onChange }: Props) {
  return (
    <div>
      <p className="colorTitle">Choisis ta couleur !</p>
      <div className="swatches">
        {colors.map((color) => (
          <div
            key={color.id}
            className={`swatch ${selected === color.id ? 'active' : ''}`}
            style={{ backgroundColor: color.code }}
            onClick={() => onChange(color.id, color.image, color.name)}
          />
        ))}
      </div>
    </div>
  )
}