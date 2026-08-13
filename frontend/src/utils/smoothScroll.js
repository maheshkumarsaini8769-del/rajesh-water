/**
 * Smooth-scroll to a same-page section identified by its hash
 * (#home, #products, #about, #contact) without a native browser hash jump.
 *
 * The URL fragment is updated via history.replaceState afterwards, so the
 * hash-based admin router (#/admin) in App.jsx never sees a hashchange and
 * never resets the scroll position to the top.
 */
export function scrollToHash(hash) {
  if (typeof document === 'undefined') return
  const target = document.querySelector(hash)
  if (!target) return

  // The menu / cart drawer lock page scroll with body overflow hidden.
  // Clear it synchronously so the scroll is not silently swallowed.
  document.body.style.overflow = ''

  // Wait one frame so any closing menu re-render can settle first.
  requestAnimationFrame(() => {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

/**
 * Click handler for in-page section links (e.g. <a href="#about">).
 * Leaves router-style hashes (#/…) and external links untouched.
 */
export function onAnchorClick(e) {
  const href = e.currentTarget?.getAttribute('href')
  if (!href || href.length < 2 || !href.startsWith('#') || href.startsWith('#/')) {
    return
  }

  e.preventDefault()
  scrollToHash(href)

  try {
    history.replaceState(null, '', href)
  } catch {
    /* some sandboxed contexts disallow history updates */
  }
}