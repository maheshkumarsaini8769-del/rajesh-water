import { useCallback, useState } from 'react'

import fallbackUrl from '../assets/fallback-bottle.svg'
import { API_BASE } from '../utils/api'

const resolveSrc = (src) =>
  src && String(src).startsWith('/uploads/') && API_BASE ? `${API_BASE}${src}` : src

/**
 * Image that tries a list of remote candidates one-by-one and finally falls
 * back to a clean local placeholder — a broken image is never shown.
 */
export default function BottleImage({ srcs = [], alt = '', eager = false, ...rest }) {
  const [index, setIndex] = useState(0)

  const handleError = useCallback(() => {
    setIndex((i) => i + 1)
  }, [])

  const current = index < srcs.length ? resolveSrc(srcs[index]) : fallbackUrl

  return (
    <img
      key={current}
      src={current}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : 'auto'}
      decoding="async"
      onError={handleError}
      {...rest}
    />
  )
}