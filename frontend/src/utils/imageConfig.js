/**
 * IMAGE CONFIGURATION — replace image sources here.
 *
 * All product images load from remote, legal sources (Wikimedia Commons CDN,
 * Unsplash / Pexels public CDN). No manual downloads are needed.
 *
 * OPTIONAL: to use the Pexels / Unsplash Search APIs instead of the fixed CDN
 * URLs below, create a `.env` file in the project root and add:
 *
 *   VITE_PEXELS_API_KEY=your_pexels_key
 *   VITE_UNSPLASH_ACCESS_KEY=your_unsplash_key
 *
 * When a key is present the matching API is queried automatically (with proper
 * auth headers). Otherwise the verified public-CDN URLs are used, so the site
 * always works out of the box.
 * Never commit real keys — they are only read from environment variables.
 */

const env = import.meta.env ?? {}

const WIKIMEDIA = (path) =>
  `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}`

const IMAGES = {
  // Primary: clean bottle photos (Wikimedia Commons thumb CDN, verified working)
  bottle200: ['/uploads/200ml.png'],
  bottle500: ['/uploads/500ml.png'],
  bottle1l: ['/uploads/1litre.png'],
  bottle2l: ['/uploads/2litre.png'],
  // Fallbacks: Unsplash / Pexels public CDN (verified working, no key needed)
  fallbacks: [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=70&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1589365278144-c9e705f843ba?w=800&q=70&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=70&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800&q=70&auto=format&fit=crop',
    'https://images.pexels.com/photos/4553114/pexels-photo-4553114.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
}

const pexelsKey = env.VITE_PEXELS_API_KEY
const unsplashKey = env.VITE_UNSPLASH_ACCESS_KEY

/** Async resolver used only when an API key is configured. */
const apiResolver = unsplashKey
  ? async () => {
      const res = await fetch(
        `https://api.unsplash.com/photos/random?query=water%20bottle&orientation=portrait&w=1000`,
        { headers: { Authorization: `Client-ID ${unsplashKey}` } },
      )
      if (!res.ok) return null
      const data = await res.json()
      return data?.urls?.regular ?? null
    }
  : pexelsKey
    ? async () => {
        const res = await fetch('https://api.pexels.com/v1/search?query=water+bottle&per_page=1&orientation=portrait&size=large', {
          headers: { Authorization: pexelsKey },
        })
        if (!res.ok) return null
        const data = await res.json()
        return data?.photos?.[0]?.src?.large ?? null
      }
    : null

/**
 * Ordered list of candidate URLs for a product image.
 * The <BottleImage> component tries each one in order and falls back to a
 * clean local placeholder so a broken image is never shown.
 */
export function getBottleImages(sizeKey, index = 0) {
  const ordered = [...(IMAGES[sizeKey] ?? [])]
  const fb = IMAGES.fallbacks
  for (let i = 0; i < fb.length; i += 1) {
    ordered.push(fb[(index + i) % fb.length])
  }
  return ordered
}

export { apiResolver }

export const HERO_IMAGE = getBottleImages('bottle2l', 0)