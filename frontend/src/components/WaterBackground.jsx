import { Fragment } from 'react'

/** Slow-moving water shapes, bubbles and wave lines behind the whole page. */
export default function WaterBackground() {
  const bubbles = [
    { left: '6%', bottom: '12%', size: 26, duration: 22, delay: 0 },
    { left: '16%', bottom: '6%', size: 14, duration: 27, delay: 4 },
    { left: '28%', bottom: '18%', size: 20, duration: 24, delay: 9 },
    { left: '42%', bottom: '8%', size: 12, duration: 30, delay: 2 },
    { left: '58%', bottom: '14%', size: 22, duration: 21, delay: 6 },
    { left: '70%', bottom: '5%', size: 15, duration: 26, delay: 11 },
    { left: '82%', bottom: '16%', size: 24, duration: 23, delay: 3 },
    { left: '92%', bottom: '9%', size: 13, duration: 29, delay: 7 },
  ]

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div
        className="water-blob left-[-10%] top-[8%] h-[420px] w-[420px] bg-brand-100/70"
        style={{ animationDuration: '26s' }}
      />
      <div
        className="water-blob right-[-12%] top-[38%] h-[480px] w-[480px] bg-aqua-100/60"
        style={{ animationDuration: '34s', animationDelay: '-10s' }}
      />
      <div
        className="water-blob bottom-[-14%] left-[22%] h-[420px] w-[420px] bg-brand-200/50"
        style={{ animationDuration: '40s', animationDelay: '-20s' }}
      />
      <div className="wave-line bottom-[26%] h-16 text-brand-100/70">
        <svg className="h-full w-full" viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path
            d="M0 40 C 240 80, 480 0, 720 40 S 1200 80, 1440 40 L 1440 80 L 0 80 Z"
            fill="currentColor"
            opacity="0.5"
          />
        </svg>
      </div>
      <div className="wave-line bottom-[14%] h-14 text-aqua-100/60 [animation-delay:-9s]">
        <svg className="h-full w-full" viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path
            d="M0 40 C 240 0, 480 80, 720 40 S 1200 0, 1440 40 L 1440 80 L 0 80 Z"
            fill="currentColor"
            opacity="0.55"
          />
        </svg>
      </div>
      {bubbles.map((b, i) => (
        <Fragment key={i}>
          <span
            className="bubble"
            style={{
              left: b.left,
              bottom: b.bottom,
              width: b.size,
              height: b.size,
              animationDuration: `${b.duration}s`,
              animationDelay: `${b.delay}s`,
            }}
          />
        </Fragment>
      ))}
    </div>
  )
}