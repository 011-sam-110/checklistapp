'use client'

import { useState, useCallback } from 'react'

/* ── Subject config ──────────────────────────────────── */
const SUBJECT = {
  dsa:    { colour: '#00ffcc', tag: 'DSA' },
  systems:{ colour: '#ff9500', tag: 'SYS' },
  prog:   { colour: '#39ff14', tag: 'PRG' },
  skills: { colour: '#ff3cac', tag: 'SKL' },
}

/* ── Particle factory ────────────────────────────────── */
function makeParticles(n = 20) {
  return Array.from({ length: n }, (_, i) => {
    const angle = (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.4
    const dist  = 55 + Math.random() * 90
    return {
      id:  i,
      tx:  Math.cos(angle) * dist,
      ty:  Math.sin(angle) * dist,
      sz:  3 + Math.random() * 6,
      dur: 0.65 + Math.random() * 0.45,
      dly: Math.random() * 0.09,
    }
  })
}

export default function TaskItem({ task, checked, onToggle }) {
  const cfg = SUBJECT[task.subject] ?? SUBJECT.dsa

  /* Local burst state — purely visual */
  const [burst, setBurst] = useState(null)

  const handleClick = useCallback((e) => {
    const wasChecked = checked
    onToggle(task.id)

    if (!wasChecked) {
      /* Fire the full completion ceremony */
      const cx = e.clientX
      const cy = e.clientY
      const id = Date.now()

      setBurst({ id, cx, cy, particles: makeParticles(20) })
      setTimeout(() => setBurst(null), 1400)
    }
  }, [checked, task.id, onToggle])

  const c = cfg.colour

  return (
    <>
      {/* ════════════════════════════════════════════════
          BURST EFFECTS  (position:fixed — never clipped)
      ════════════════════════════════════════════════ */}
      {burst && (
        <>
          {/* 1. Full-screen flash */}
          <div
            key={`flash-${burst.id}`}
            aria-hidden="true"
            className="fixed inset-0 pointer-events-none"
            style={{
              zIndex: 8999,
              backgroundColor: c,
              animation: 'screenFlash 0.28s ease-out forwards',
            }}
          />

          {/* 2. Shockwave ring */}
          <div
            key={`shock-${burst.id}`}
            aria-hidden="true"
            className="burst-shockwave"
            style={{
              left: burst.cx, top: burst.cy,
              width: 160, height: 160,
              border: `2px solid ${c}`,
              boxShadow: `0 0 24px ${c}, inset 0 0 24px ${c}30`,
            }}
          />

          {/* 3. Particles */}
          {burst.particles.map(p => (
            <div
              key={p.id}
              aria-hidden="true"
              className="burst-particle"
              style={{
                left: burst.cx, top: burst.cy,
                width: p.sz, height: p.sz,
                background: c,
                boxShadow: `0 0 ${p.sz * 2}px ${c}`,
                '--tx':    `${p.tx}px`,
                '--ty':    `${p.ty}px`,
                '--dur':   `${p.dur}s`,
                '--delay': `${p.dly}s`,
              }}
            />
          ))}

          {/* 4. Floating stamp */}
          <div
            key={`stamp-${burst.id}`}
            aria-hidden="true"
            className="burst-stamp"
            style={{
              left: burst.cx, top: burst.cy,
              color: c,
              borderColor: c,
              textShadow: `0 0 12px ${c}`,
              boxShadow:  `0 0 24px ${c}40`,
            }}
          >
            ✓ DONE
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════
          TASK ROW
      ════════════════════════════════════════════════ */}
      <div
        className="task-row group flex items-center gap-2.5 px-3 py-2.5 rounded-md transition-shadow duration-200"
        data-subject={task.subject}
        onClick={handleClick}
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => e.key === ' ' && handleClick(e)}
        style={{
          background:   checked ? `${c}0b` : 'var(--surface)',
          border:       `1px solid ${checked ? c + '28' : 'var(--border)'}`,
          transition:   'background 0.3s, border-color 0.3s, box-shadow 0.2s',
          opacity:      checked ? 0.65 : 1,
        }}
        onMouseEnter={(e) => {
          if (!checked) {
            e.currentTarget.style.background   = `${c}18`
            e.currentTarget.style.borderColor  = `${c}50`
            e.currentTarget.style.boxShadow    = `0 0 22px ${c}18, 0 0 8px ${c}0c`
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background  = checked ? `${c}0b` : 'var(--surface)'
          e.currentTarget.style.borderColor = checked ? `${c}28` : 'var(--border)'
          e.currentTarget.style.boxShadow   = 'none'
        }}
      >
        {/* Scan line (visible only during burst) */}
        {burst && <div className="scan-flash" aria-hidden="true" />}

        {/* Custom checkbox circle */}
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-sm transition-all duration-200"
          style={{
            width: 16, height: 16,
            background: checked ? c : 'transparent',
            border:     `1.5px solid ${checked ? c : c + '50'}`,
            boxShadow:  checked ? `0 0 10px ${c}90, 0 0 22px ${c}40` : 'none',
          }}
        >
          {checked && (
            <svg width="8" height="7" viewBox="0 0 8 7" fill="none" aria-hidden="true">
              <path d="M1 3.5L3 5.5L7 1" stroke="#000" strokeWidth="1.6"
                    strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>

        {/* Subject badge */}
        <span
          aria-hidden="true"
          style={{
            fontFamily:   'var(--font-display)',
            fontSize:     '0.58rem',
            color:         c,
            letterSpacing: '0.08em',
            flexShrink:    0,
            opacity:       checked ? 0.4 : 1,
            transition:    'opacity 0.3s',
          }}
        >
          {cfg.tag}
        </span>

        {/* Label + laser strikethrough */}
        <span
          className="flex-1 relative text-xs leading-snug"
          style={{
            fontFamily: 'var(--font-body)',
            color:      checked ? 'rgba(200,200,232,0.28)' : 'var(--text)',
            transition: 'color 0.4s',
          }}
        >
          {task.label}

          {/* Laser bar — animates width from 0 → 100% on check */}
          <span
            aria-hidden="true"
            style={{
              position:   'absolute',
              top: '50%',
              left: 0,
              height: '1.5px',
              transform:  'translateY(-50%)',
              borderRadius: 1,
              pointerEvents: 'none',
              background:  `linear-gradient(90deg, ${c}, ${c}55)`,
              boxShadow:   `0 0 6px ${c}`,
              width:       checked ? '100%' : '0%',
              transition:  'width 0.48s cubic-bezier(0.4, 0, 0.2, 1) 0.06s',
            }}
          />
        </span>
      </div>
    </>
  )
}
