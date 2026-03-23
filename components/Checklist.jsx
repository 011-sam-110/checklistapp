'use client'

import { useState, useEffect } from 'react'
import { weeks } from '@/data/tasks'
import WeekSection from './WeekSection'

const STORAGE_KEY = 'backontrack-checklist'

export default function Checklist() {
  const [activeWeek, setActiveWeek] = useState(0)
  const [checked, setChecked] = useState({})
  const [mounted, setMounted] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setChecked(JSON.parse(saved))
    } catch {}
    setMounted(true)
  }, [])

  // Persist to localStorage on change
  useEffect(() => {
    if (!mounted) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checked))
    } catch {}
  }, [checked, mounted])

  const onToggle = (id) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Overall progress
  const allTasks = weeks.flatMap(w => w.days.flatMap(d => d.tasks))
  const totalDone = allTasks.filter(t => checked[t.id]).length
  const totalAll = allTasks.length
  const overallPct = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0

  // Per-week progress for tab badges
  const weekProgress = weeks.map(w => {
    const tasks = w.days.flatMap(d => d.tasks)
    const done = tasks.filter(t => checked[t.id]).length
    return { done, total: tasks.length }
  })

  if (!mounted) return null

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">
          Back-on-Track
        </p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
          3-Week Master Plan
        </h1>
        <p className="text-white/50 text-sm mb-6">
          {totalDone} of {totalAll} tasks completed
        </p>

        {/* Overall progress bar */}
        <div className="max-w-sm mx-auto">
          <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-1">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${overallPct}%`,
                background: 'linear-gradient(90deg, #8b5cf6, #3b82f6, #14b8a6, #ec4899)',
              }}
            />
          </div>
          <p className="text-xs text-white/30">{overallPct}% overall</p>
        </div>
      </div>

      {/* Subject legend */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {[
          { label: 'DSA', color: 'bg-purple-500/30 text-purple-300 border-purple-500/30' },
          { label: 'Systems', color: 'bg-blue-500/30 text-blue-300 border-blue-500/30' },
          { label: 'Programming', color: 'bg-teal-500/30 text-teal-300 border-teal-500/30' },
          { label: 'Prof. Skills', color: 'bg-pink-500/30 text-pink-300 border-pink-500/30' },
        ].map(s => (
          <span
            key={s.label}
            className={`text-xs font-semibold px-3 py-1 rounded-full border ${s.color}`}
          >
            {s.label}
          </span>
        ))}
      </div>

      {/* Week tabs */}
      <div className="flex justify-center gap-3 mb-8">
        {weeks.map((w, i) => {
          const { done, total } = weekProgress[i]
          const pct = total > 0 ? Math.round((done / total) * 100) : 0
          const isActive = activeWeek === i
          return (
            <button
              key={w.week}
              onClick={() => setActiveWeek(i)}
              className={`
                relative px-6 py-3 rounded-2xl font-semibold text-sm transition-all duration-200
                ${isActive
                  ? 'bg-white/15 text-white shadow-lg shadow-white/5 border border-white/20'
                  : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white/80'
                }
              `}
            >
              <span className="block">Week {w.week}</span>
              <span className={`block text-xs mt-0.5 ${isActive ? 'text-white/60' : 'text-white/30'}`}>
                {pct}%
              </span>
            </button>
          )
        })}
      </div>

      {/* Active week content */}
      <div className="glass-card rounded-3xl p-6 md:p-8">
        <WeekSection
          weekData={weeks[activeWeek]}
          checked={checked}
          onToggle={onToggle}
        />
      </div>

      {/* Reset button */}
      <div className="text-center mt-8">
        <button
          onClick={() => {
            if (confirm('Reset all progress? This cannot be undone.')) {
              setChecked({})
            }
          }}
          className="text-xs text-white/20 hover:text-white/50 transition-colors underline underline-offset-4"
        >
          Reset all progress
        </button>
      </div>
    </div>
  )
}
