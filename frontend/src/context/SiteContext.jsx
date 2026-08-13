import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import {
  DEFAULT_CONTENT,
  loadContent,
  resetContent,
  saveContent,
} from '../data/siteContent'

const SiteContext = createContext(null)

export function SiteProvider({ children }) {
  const [content, setContent] = useState(loadContent)
  const [savedAt, setSavedAt] = useState(0)

  /** Update a nested value by dot path, e.g. update('hero.titleA', '…') */
  const update = useCallback((path, value) => {
    setContent((prev) => {
      const keys = path.split('.')
      const next = { ...prev }
      let node = next
      for (let i = 0; i < keys.length - 1; i += 1) {
        const k = keys[i]
        node[k] = Array.isArray(node[k]) ? [...node[k]] : { ...node[k] }
        node = node[k]
      }
      node[keys[keys.length - 1]] = value
      return next
    })
  }, [])

  /** Update one item of a list by index, e.g. updateAt('products.items', 0, {label}…) */
  const updateAt = useCallback((path, index, value) => {
    setContent((prev) => {
      const keys = path.split('.')
      const next = { ...prev }
      let node = next
      for (let i = 0; i < keys.length - 1; i += 1) {
        const k = keys[i]
        node[k] = Array.isArray(node[k]) ? [...node[k]] : { ...node[k] }
        node = node[k]
      }
      const arr = [...node[keys[keys.length - 1]]]
      arr[index] = { ...arr[index], ...value }
      node[keys[keys.length - 1]] = arr
      return next
    })
  }, [])

  const save = useCallback(() => {
    setContent((prev) => {
      saveContent(prev)
      setSavedAt(Date.now())
      return prev
    })
  }, [])

  const reset = useCallback(() => {
    setContent(resetContent())
    setSavedAt(Date.now())
  }, [])

  const value = useMemo(
    () => ({ content, update, updateAt, save, reset, savedAt }),
    [content, update, updateAt, save, reset, savedAt],
  )

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}

export function useSite() {
  const ctx = useContext(SiteContext)
  if (!ctx) throw new Error('useSite must be used inside <SiteProvider>')
  return ctx
}