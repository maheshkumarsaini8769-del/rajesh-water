import { useSiteData } from '../context/SiteDataContext'
import ProductCard from './ProductCard'

const DARK = '#00658d'

export default function ProductSection() {
  const { products, settings, ready } = useSiteData()
  const items = products ?? []

  return (
    <section id="products" className="relative scroll-mt-24 py-[60px] md:py-[100px]">
      <div className="mx-auto max-w-[1280px] px-5 md:px-16">
        <div className="mx-auto mb-16 max-w-2xl space-y-4 text-center" data-reveal>
          <span
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: DARK }}
          >
            Our Bottles
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1a1c1c] sm:text-4xl">
            Choose Your Bottle
          </h2>
          <p className="mx-auto max-w-2xl text-base text-[#3e4850]">
            Pick the size you need — every order is delivered fresh and sealed.
            Minimum order is {settings.minOrder} bottles.
            {!ready && ' Loading prices…'}
          </p>
        </div>

        <div
          className="grid grid-cols-2 gap-x-3.5 gap-y-24 pt-16 sm:gap-x-6 sm:gap-y-36 sm:pt-28 md:grid-cols-3 md:gap-x-8 md:gap-y-40 md:pt-32"
          data-reveal-group
        >
          {items.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              reveal={product.id !== 'bottle-200ml'}
            />
          ))}
        </div>
      </div>
    </section>
  )
}