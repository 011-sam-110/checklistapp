'use client'

import { useEffect, useRef, useState } from 'react'

/* Colour map — matches CSS subject vars */
const SUBJECT_COLOURS = {
  dsa:    '#00ffcc',
  sys:    '#ff9500',
  prog:   '#39ff14',
  skills: '#ff3cac',
}
const DEFAULT_COLOUR = '#00ffcc'

export default function CursorEffect() {
  const dotRef  = useRef(null)
  const ringRef = useRef(null)

  /* Reactive state for className changes */
  const [hovering, setHovering] = useState(false)
  const [clicking, setClicking] = useState(false)

  useEffect(() => {
    /* Target coords (updated instantly on mousemove) */
    let tx = -100, ty = -100
    /* Ring follows with spring lag */
    let rx = -100, ry = -100
    let rafId

    /* ── Mouse tracking ── */
    const onMove = (e) => { tx = e.clientX; ty = e.clientY }

    const onDown = () => setClicking(true)
    const onUp   = () => setClicking(false)

    /* ── Hover detection — reads nearest [data-subject] ancestor ── */
    const onOver = (e) => {
      const target = e.target

      /* Colour from subject */
      const subjectEl = target.closest('[data-subject]')
      const colour = subjectEl
        ? (SUBJECT_COLOURS[subjectEl.dataset.subject] ?? DEFAULT_COLOUR)
        : DEFAULT_COLOUR

      if (dotRef.current)  dotRef.current.style.background  = colour
      if (dotRef.current)  dotRef.current.style.boxShadow   = `0 0 8px ${colour}, 0 0 18px ${colour}`
      if (ringRef.current) ringRef.current.style.borderColor = colour

      /* Expand ring on interactive elements */
      const isInteractive = target.closest('button, label, a, [role="button"], .task-row')
      setHovering(!!isInteractive)
    }

    const onOut = () => {
      const c = DEFAULT_COLOUR
      if (dotRef.current)  { dotRef.current.style.background = c; dotRef.current.style.boxShadow = `0 0 8px ${c}, 0 0 18px ${c}` }
      if (ringRef.current) ringRef.current.style.borderColor = c
      setHovering(false)
    }

    /* ── RAF loop — ring lerps to dot position ── */
    const tick = () => {
      rx += (tx - rx) * 0.13
      ry += (ty - ry) * 0.13

      if (dotRef.current)
        dotRef.current.style.transform  = `translate(calc(${tx}px - 50%), calc(${ty}px - 50%))`
      if (ringRef.current)
        ringRef.current.style.transform = `translate(calc(${rx}px - 50%), calc(${ry}px - 50%))`

      rafId = requestAnimationFrame(tick)
    }

    document.addEventListener('mousemove',  onMove, { passive: true })
    document.addEventListener('mousedown',  onDown)
    document.addEventListener('mouseup',    onUp)
    document.addEventListener('mouseover',  onOver)
    document.addEventListener('mouseout',   onOut)
    rafId = requestAnimationFrame(tick)

    return () => {
      document.removeEventListener('mousemove',  onMove)
      document.removeEventListener('mousedown',  onDown)
      document.removeEventListener('mouseup',    onUp)
      document.removeEventListener('mouseover',  onOver)
      document.removeEventListener('mouseout',   onOut)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <>
      {/* Inner dot — instant follow */}
      <div ref={dotRef}  className="cursor-dot"  aria-hidden="true" />
      {/* Outer ring — spring lag */}
      <div
        ref={ringRef}
        className={`cursor-ring ${hovering ? 'is-hovering' : ''} ${clicking ? 'is-clicking' : ''}`}
        aria-hidden="true"
      />
    </>
  )
}
