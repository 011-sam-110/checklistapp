'use client'

import { useState, useEffect } from 'react'
import { weeks } from '@/data/tasks'
import WeekSection from './WeekSection'

const STORAGE_KEY = 'backontrack-v2'

/* Subject legend entries */
const LEGEND = [
  { key: 'dsa',    label: 'DSA',         colour: '#00ffcc' },
  { key: 'systems',label: 'Systems',     colour: '#ff9500' },
  { key: 'prog',   label: 'Programming', colour: '#39ff14' },
  { key: 'skills', label: 'Prof. Skills',colour: '#ff3cac' },
]

export default function Checklist() {
  const [activeWeek, setActiveWeek] = useState(0)
  const [checked,    setChecked]    = useState({})
  const [mounted,    setMounted]    = useState(false)

  /* ── Persist / restore ── */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setChecked(JSON.parse(raw))
    } catch {}
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(checked)) } catch {}
  }, [checked, mounted])

  const onToggle = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }))

  /* ── Derived stats ── */
  const allTasks     = weeks.flatMap(w => w.days.flatMap(d => d.tasks))
  const totalDone    = allTasks.filter(t => checked[t.id]).length
  const totalAll     = allTasks.length
  const overallPct   = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0

  const weekProgress = weeks.map(w => {
    const tasks = w.days.flatMap(d => d.tasks)
    const done  = tasks.filter(t => checked[t.id]).length
    return { done, total: tasks.length, pct: tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0 }
  })

  if (!mounted) return null

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12 md:py-16">

      {/* ══════════════════════════════════════
          HERO HEADER
      ══════════════════════════════════════ */}
      <header className="mb-12 md:mb-14">

        {/* Eyebrow */}
        <p
          style={{
            fontFamily:    'var(--font-display)',
            fontSize:      '0.7rem',
            letterSpacing: '0.25em',
            color:         '#00ffcc',
            textShadow:    '0 0 12px #00ffcc',
            marginBottom:  '0.5rem',
          }}
        >
          COMMAND CENTRE · ACADEMIC RECOVERY
        </p>

        {/* Main title */}
        <h1
          style={{
            fontFamily:    'var(--font-display)',
            fontSize:      'clamp(3rem, 9vw, 7rem)',
            letterSpacing: '0.04em',
            lineHeight:    0.92,
            color:         '#ffffff',
            textShadow:    '0 0 40px rgba(0,255,204,0.12)',
            marginBottom:  '1.5rem',
          }}
        >
          3-WEEK<br />
          <span style={{ color: '#00ffcc', textShadow: '0 0 30px #00ffcc, 0 0 60px #00ffcc60' }}>
            MASTER PLAN
          </span>
        </h1>

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-6 mb-5">
          <span
            style={{
              fontFamily:    'var(--font-body)',
              fontSize:      '0.75rem',
              color:         'var(--text-muted)',
              letterSpacing: '0.06em',
            }}
          >
            {totalDone} <span style={{ color: '#00ffcc' }}>completed</span> · {totalAll - totalDone} remaining
          </span>

          {/* Subject legend */}
          <div className="flex flex-wrap gap-2">
            {LEGEND.map(s => (
              <span
                key={s.key}
                style={{
                  fontFamily:    'var(--font-display)',
                  fontSize:      '0.6rem',
                  letterSpacing: '0.1em',
                  color:          s.colour,
                  border:        `1px solid ${s.colour}40`,
                  background:    `${s.colour}0d`,
                  padding:       '2px 10px',
                  borderRadius:  '2px',
                  textShadow:    `0 0 8px ${s.colour}80`,
                }}
              >
                {s.label.toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="max-w-lg">
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width:      `${overallPct}%`,
                background: 'linear-gradient(90deg, #00ffcc, #3b82f6, #39ff14, #ff3cac)',
                color:      '#00ffcc',
                boxShadow:  overallPct > 0 ? '0 0 12px #00ffcc60' : 'none',
              }}
            />
          </div>
          <p
            style={{
              fontFamily:    'var(--font-body)',
              fontSize:      '0.6rem',
              color:         'var(--text-dim)',
              letterSpacing: '0.06em',
              marginTop:     '0.4rem',
            }}
          >
            {overallPct}% OVERALL
          </p>
        </div>
      </header>

      {/* ══════════════════════════════════════
          WEEK SELECTOR TABS
      ══════════════════════════════════════ */}
      <div className="flex gap-3 mb-8">
        {weeks.map((w, i) => {
          const { done, total, pct } = weekProgress[i]
          const active = activeWeek === i
          const wColour = ['#00ffcc', '#ff9500', '#ff3cac'][i]

          return (
            <button
              key={w.week}
              onClick={() => setActiveWeek(i)}
              className="relative flex-1 md:flex-none md:min-w-[140px] py-3 px-5 rounded-lg transition-all duration-200"
              style={{
                fontFamily:    'var(--font-display)',
                letterSpacing: '0.08em',
                background:    active ? `${wColour}15` : 'var(--surface)',
                border:        `1px solid ${active ? wColour + '50' : 'var(--border)'}`,
                boxShadow:     active ? `0 0 24px ${wColour}18` : 'none',
                color:         active ? wColour : 'var(--text-muted)',
                textShadow:    active ? `0 0 12px ${wColour}` : 'none',
                cursor:        'none',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background   = `${wColour}0d`
                  e.currentTarget.style.borderColor  = `${wColour}30`
                  e.currentTarget.style.color        = 'var(--text)'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background  = 'var(--surface)'
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.color       = 'var(--text-muted)'
                }
              }}
            >
              <span style={{ fontSize: '1.1rem', display: 'block' }}>WEEK {w.week}</span>
              <span
                style={{
                  fontFamily:    'var(--font-body)',
                  fontSize:      '0.58rem',
                  letterSpacing: '0.04em',
                  color:         active ? wColour + 'cc' : 'var(--text-dim)',
                  display:       'block',
                  marginTop:     '0.1rem',
                }}
              >
                {done}/{total} · {pct}%
              </span>
            </button>
          )
        })}
      </div>

      {/* ══════════════════════════════════════
          ACTIVE WEEK PANEL
      ══════════════════════════════════════ */}
      <div
        className="rounded-2xl p-5 md:p-8"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border:     '1px solid rgba(255,255,255,0.07)',
          boxShadow:  '0 0 0 1px rgba(255,255,255,0.03) inset, 0 32px 64px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <WeekSection
          weekData={weeks[activeWeek]}
          checked={checked}
          onToggle={onToggle}
        />
      </div>

      {/* ══════════════════════════════════════
          RESET
      ══════════════════════════════════════ */}
      <div className="text-center mt-10">
        <button
          onClick={() => { if (confirm('Reset ALL progress? This cannot be undone.')) setChecked({}) }}
          style={{
            fontFamily:    'var(--font-display)',
            fontSize:      '0.6rem',
            letterSpacing: '0.15em',
            color:         'var(--text-dim)',
            background:    'none',
            border:        'none',
            textDecoration:'underline',
            textUnderlineOffset: '4px',
            cursor:        'none',
            transition:    'color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,60,172,0.6)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
        >
          RESET ALL PROGRESS
        </button>
      </div>
    </div>
  )
}
