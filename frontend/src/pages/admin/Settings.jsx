import { useCallback, useEffect, useState } from 'react'
import { FaCircleCheck } from 'react-icons/fa6'

import { api } from '../../utils/api'
import { HERO_IMAGE } from '../../utils/imageConfig'
import { Card, ErrorState, ImageInput, Spinner, inputClass } from './ui'

export default function Settings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    api
      .get('/settings')
      .then(setSettings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const set = (key) => (e) => {
    setSettings((s) => ({ ...s, [key]: e.target.value }))
    setSaved(false)
  }

  const save = () => {
    setSaving(true)
    api
      .put('/settings', {
        businessName: settings.businessName,
        whatsappNumber: settings.whatsappNumber,
        contactNumber: settings.contactNumber,
        deliveryMessage: settings.deliveryMessage,
        minOrder: Number(settings.minOrder) || 48,
        heroImage: settings.heroImage || '',
      })
      .then((updated) => {
        setSettings(updated)
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      })
      .catch((e) => setError(e.message))
      .finally(() => setSaving(false))
  }

  if (loading) return <Spinner label="Loading settingsâ€¦" />
  if (error && !settings) return <ErrorState message={error} onRetry={load} />

  const fields = [
    { key: 'businessName', label: 'Business name', hint: 'Shown in the navbar, footer and order messages.' },
    { key: 'whatsappNumber', label: 'WhatsApp number', hint: 'Digits only, e.g. 7742735762 â€” orders go to this number.' },
    { key: 'contactNumber', label: 'Contact number', hint: 'Digits only â€” used for the call buttons.' },
    { key: 'deliveryMessage', label: 'Delivery message', hint: 'The delivery info shown on the contact section.' },
    { key: 'minOrder', label: 'Minimum order quantity', hint: 'Customers must order at least this many bottles.' },
  ]

  return (
    <Card
      title="Settings"
      description="Basic business details used across the website."
      actions={
        <button
          type="button"
          onClick={save}
          disabled={saving || saved}
          className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(31,143,88,0.32)] transition-all hover:-translate-y-0.5 disabled:opacity-70 ${
            saved ? 'bg-brand-700' : 'bg-gradient-to-r from-brand-500 to-brand-600'
          }`}
        >
          <FaCircleCheck />
          {saved ? 'Saved âœ“' : saving ? 'Savingâ€¦' : 'Save settings'}
        </button>
      }
    >
      {error && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-500">
          {error}
        </p>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((f) => (
          <label key={f.key} className="block">
            <span className="mb-1.5 block text-xs font-bold tracking-wide text-ink-900/70 uppercase">
              {f.label}
            </span>
            <input
              type={f.key === 'minOrder' ? 'number' : 'text'}
              value={settings[f.key] ?? ''}
              min={f.key === 'minOrder' ? 1 : undefined}
              onChange={set(f.key)}
              className={inputClass}
            />
            {f.hint && <span className="mt-1 block text-[11px] text-ink-900/45">{f.hint}</span>}
          </label>
        ))}
      </div>
      <div className="mt-7 border-t border-brand-100 pt-6">
        <ImageInput
          label="Home page image (hero)"
          value={settings.heroImage ?? ''}
          onChange={(v) => {
            setSettings((s) => ({ ...s, heroImage: v }))
            setSaved(false)
          }}
          fallback={HERO_IMAGE[0]}
          hint="The main bottle image on the top of the home page. Leave empty to use the built-in one."
        />
      </div>
    </Card>
  )
}