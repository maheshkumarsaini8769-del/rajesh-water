import { useEffect, useRef, useState } from 'react'

import CartDrawer from './components/CartDrawer'
import FloatingActions from './components/FloatingActions'
import Navbar from './components/Navbar'
import WaterBackground from './components/WaterBackground'
import { CartProvider } from './context/CartContext'
import { SiteDataProvider } from './context/SiteDataContext'
import { SiteProvider } from './context/SiteContext'
import Admin from './pages/Admin'
import Home from './pages/Home'
import { initScrollAnimations } from './utils/animations'

function isAdminRoute() {
  if (typeof window === 'undefined') return false
  return window.location.hash.startsWith('#/admin')
}

function Storefront({ rootRef }) {
  useEffect(() => {
    initScrollAnimations(rootRef.current)
  }, [rootRef])

  return (
    <>
      <WaterBackground />
      <div className="relative z-10">
        <Navbar />
        <main>
          <Home />
        </main>
        <CartDrawer />
        <FloatingActions />
      </div>
    </>
  )
}

export default function App() {
  const rootRef = useRef(null)
  const [isAdmin, setIsAdmin] = useState(isAdminRoute)

  useEffect(() => {
    const onHashChange = () => {
      const next = isAdminRoute()
      setIsAdmin((prev) => {
        if (prev !== next) window.scrollTo(0, 0)
        return next
      })
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return (
    <SiteProvider>
      <SiteDataProvider>
        <CartProvider>
          <div ref={rootRef} className={isAdmin ? 'min-h-svh' : 'relative min-h-svh'}>
            {isAdmin ? <Admin /> : <Storefront rootRef={rootRef} />}
          </div>
        </CartProvider>
      </SiteDataProvider>
    </SiteProvider>
  )
}