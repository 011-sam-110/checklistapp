'use client'

import { useEffect, useRef, useState } from 'react'

const DEFAULT_COLOUR = '#00ffcc'

function getSubjectColour(subjectId) {
  if (!subjectId) return DEFAULT_COLOUR
  const val = getComputedStyle(document.documentElement)
    .getPropertyValue(`--cat-${subjectId}`)
    .trim()
  return val || DEFAULT_COLOUR
}

/* Parse a 6-char hex colour → [r, g, b] integers */
function hexRGB(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}

export default function CursorEffect() {
  const dotRef    = useRef(null)
  const ringRef   = useRef(null)
  const auraRef   = useRef(null)   // large slow-follow background orb
  const canvasRef = useRef(null)   // glowing comet trail

  const [hovering, setHovering] = useState(false)
  const [clicking, setClicking] = useState(false)

  useEffect(() => {
    /* ── Positions ───────────────────────────────────── */
    let tx = -200, ty = -200   // cursor  (instant)
    let rx = -200, ry = -200   // ring    (fast lag  ~13 %)
    let ax = -200, ay = -200   // aura    (slow lag   ~4 %)

    let currentColour = DEFAULT_COLOUR
    let rafId

    /* ── Canvas setup ────────────────────────────────── */
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')

    const resize = () => {
      /* Preserve existing content on resize by copying it */
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize, { passive: true })

    /* ── Event handlers ──────────────────────────────── */
    const onMove = (e) => { tx = e.clientX; ty = e.clientY }
    const onDown = () => setClicking(true)
    const onUp   = () => setClicking(false)

    const onOver = (e) => {
      const target    = e.target
      const subjectEl = target.closest('[data-subject]')
      const colour    = subjectEl
        ? getSubjectColour(subjectEl.dataset.subject)
        : DEFAULT_COLOUR

      currentColour = colour

      const [r, g, b] = hexRGB(colour)

      if (dotRef.current) {
        dotRef.current.style.background = colour
        dotRef.current.style.boxShadow  = `0 0 8px ${colour}, 0 0 18px ${colour}`
      }
      if (ringRef.current) ringRef.current.style.borderColor = colour
      if (auraRef.current) {
        auraRef.current.style.background =
          `radial-gradient(circle at center, rgba(${r},${g},${b},0.14) 0%, transparent 70%)`
      }

      setHovering(!!target.closest('button, label, a, [role="button"], .task-row'))
    }

    const onOut = () => {
      const colour    = DEFAULT_COLOUR
      const [r, g, b] = hexRGB(colour)
      currentColour   = colour

      if (dotRef.current) {
        dotRef.current.style.background = colour
        dotRef.current.style.boxShadow  = `0 0 8px ${colour}, 0 0 18px ${colour}`
      }
      if (ringRef.current) ringRef.current.style.borderColor = colour
      if (auraRef.current) {
        auraRef.current.style.background =
          `radial-gradient(circle at center, rgba(${r},${g},${b},0.14) 0%, transparent 70%)`
      }

      setHovering(false)
    }

    /* ── Trail buffer ───────────────────────────────── */
    const trail = []
    const MAX_TRAIL = 50  // ~0.83 s at 60 fps

    /* ── RAF loop ────────────────────────────────────── */
    const tick = () => {
      /* Spring-lerp ring */
      rx += (tx - rx) * 0.13
      ry += (ty - ry) * 0.13

      /* Heavy-lerp aura (dreamy slow follow) */
      ax += (tx - ax) * 0.038
      ay += (ty - ay) * 0.038

      /* Move DOM elements via transform (GPU layer — no layout) */
      if (dotRef.current)
        dotRef.current.style.transform  = `translate(calc(${tx}px - 50%), calc(${ty}px - 50%))`
      if (ringRef.current)
        ringRef.current.style.transform = `translate(calc(${rx}px - 50%), calc(${ry}px - 50%))`
      if (auraRef.current)
        auraRef.current.style.transform = `translate(calc(${ax}px - 50%), calc(${ay}px - 50%))`

      /* ── Canvas comet trail ───────────────────────────
         Store cursor positions in a fixed-length ring buffer.
         Each frame: clear the canvas entirely, then redraw every
         stored point with opacity scaled by its age. This avoids
         the 8-bit alpha precision issue that causes destination-out
         fading to leave a permanent ghost.
      ─────────────────────────────────────────────────── */
      const W = canvas.width
      const H = canvas.height

      /* Append current position to trail buffer */
      if (tx > 0 && ty > 0) {
        trail.push({ x: tx, y: ty, colour: currentColour })
        if (trail.length > MAX_TRAIL) trail.shift()
      }

      /* Clear canvas fully — no residual pixels */
      ctx.clearRect(0, 0, W, H)

      /* Draw each trail point, oldest = dim, newest = bright */
      for (let i = 0; i < trail.length; i++) {
        const p = trail[i]
        const t = (i + 1) / trail.length   // 0 → oldest, 1 → newest
        const [vr, vg, vb] = hexRGB(p.colour)

        /* Layer 1 — large soft halo (40 px radius) */
        const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 40)
        halo.addColorStop(0, `rgba(${vr},${vg},${vb},${0.14 * t})`)
        halo.addColorStop(1, `rgba(${vr},${vg},${vb},0)`)
        ctx.fillStyle = halo
        ctx.beginPath()
        ctx.arc(p.x, p.y, 40, 0, Math.PI * 2)
        ctx.fill()

        /* Layer 2 — medium glow (12 px radius) */
        const mid = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 12)
        mid.addColorStop(0, `rgba(${vr},${vg},${vb},${0.55 * t})`)
        mid.addColorStop(1, `rgba(${vr},${vg},${vb},0)`)
        ctx.fillStyle = mid
        ctx.beginPath()
        ctx.arc(p.x, p.y, 12, 0, Math.PI * 2)
        ctx.fill()

        /* Layer 3 — bright core (2.5 px) */
        ctx.fillStyle = `rgba(${vr},${vg},${vb},${0.9 * t})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2)
        ctx.fill()
      }

      rafId = requestAnimationFrame(tick)
    }

    /* ── Wire up ─────────────────────────────────────── */
    document.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mousedown', onDown)
    document.addEventListener('mouseup',   onUp)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout',  onOut)
    rafId = requestAnimationFrame(tick)

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('mouseup',   onUp)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout',  onOut)
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <>
      {/* ── Comet trail canvas (z-index 2, behind content) ── */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position:      'fixed',
          inset:         0,
          pointerEvents: 'none',
          zIndex:        2,
        }}
      />

      {/* ── Background aura orb (slow-follow, heavy blur) ── */}
      <div
        ref={auraRef}
        aria-hidden="true"
        style={{
          position:      'fixed',
          top:           0,
          left:          0,
          width:         560,
          height:        560,
          borderRadius:  '50%',
          background:    `radial-gradient(circle at center, rgba(0,255,204,0.14) 0%, transparent 70%)`,
          pointerEvents: 'none',
          zIndex:        1,
          filter:        'blur(48px)',
          transform:     'translate(-50%, -50%)',
          willChange:    'transform',
        }}
      />

      {/* ── Inner dot — instant follow ── */}
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />

      {/* ── Outer ring — spring lag ── */}
      <div
        ref={ringRef}
        className={`cursor-ring ${hovering ? 'is-hovering' : ''} ${clicking ? 'is-clicking' : ''}`}
        aria-hidden="true"
      />
    </>
  )
}
