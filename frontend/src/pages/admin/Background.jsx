/**
 * Soft decorative background for the admin panel — calm brand blobs on a
 * near-white canvas, matching the storefront's water feel.
 */
export default function AdminBackground() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div className="water-blob left-[-10%] top-[-6%] h-[28rem] w-[28rem] bg-brand-200/40" />
      <div className="water-blob right-[-12%] top-[28%] h-[24rem] w-[24rem] bg-aqua-200/40 [animation-delay:-8s]" />
      <div className="water-blob bottom-[-10%] left-[20%] h-[26rem] w-[26rem] bg-brand-300/25 [animation-delay:-16s]" />
    </div>
  )
}