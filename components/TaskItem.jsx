'use client'

import { useState, useCallback, useRef } from 'react'

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

export default function TaskItem({
  task, checked, onToggle,
  editMode = false, categories = [], dayName = '',
  onDelete, onUpdate,
}) {
  /* Resolve color from dynamic categories */
  const cat   = categories.find(c => c.id === task.subject)
  const c     = cat?.color ?? '#00ffcc'
  const tag   = cat ? cat.label.slice(0, 4).toUpperCase() : task.subject?.slice(0, 4).toUpperCase() ?? '???'

  const [burst,      setBurst]      = useState(null)
  const [editLabel,  setEditLabel]  = useState(task.label)
  const labelRef = useRef(null)

  const handleClick = useCallback((e) => {
    if (editMode) return
    const wasChecked = checked
    onToggle(task.id)
    if (!wasChecked) {
      const cx = e.clientX
      const cy = e.clientY
      const id = Date.now()
      setBurst({ id, cx, cy, particles: makeParticles(20) })
      setTimeout(() => setBurst(null), 1400)
    }
  }, [editMode, checked, task.id, onToggle])

  const commitLabel = () => {
    const trimmed = editLabel.trim()
    if (trimmed && trimmed !== task.label) onUpdate?.({ label: trimmed })
    else setEditLabel(task.label)
  }

  return (
    <>
      {/* ════════════════════════════════════════════════
          BURST EFFECTS  (position:fixed — never clipped)
      ════════════════════════════════════════════════ */}
      {burst && (
        <>
          <div key={`flash-${burst.id}`} aria-hidden="true" className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 8999, backgroundColor: c, animation: 'screenFlash 0.28s ease-out forwards' }}
          />
          <div key={`shock-${burst.id}`} aria-hidden="true" className="burst-shockwave"
            style={{ left: burst.cx, top: burst.cy, width: 160, height: 160,
              border: `2px solid ${c}`, boxShadow: `0 0 24px ${c}, inset 0 0 24px ${c}30` }}
          />
          {burst.particles.map(p => (
            <div key={p.id} aria-hidden="true" className="burst-particle"
              style={{ left: burst.cx, top: burst.cy, width: p.sz, height: p.sz,
                background: c, boxShadow: `0 0 ${p.sz * 2}px ${c}`,
                '--tx': `${p.tx}px`, '--ty': `${p.ty}px`, '--dur': `${p.dur}s`, '--delay': `${p.dly}s` }}
            />
          ))}
          <div key={`stamp-${burst.id}`} aria-hidden="true" className="burst-stamp"
            style={{ left: burst.cx, top: burst.cy, color: c, borderColor: c,
              textShadow: `0 0 12px ${c}`, boxShadow: `0 0 24px ${c}40` }}>
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
        role={editMode ? undefined : 'checkbox'}
        aria-checked={editMode ? undefined : checked}
        tabIndex={editMode ? undefined : 0}
        onKeyDown={(e) => !editMode && e.key === ' ' && handleClick(e)}
        draggable={editMode}
        onDragStart={editMode ? (e) => {
          e.dataTransfer.setData('application/json', JSON.stringify({ taskId: task.id, fromDay: dayName }))
          e.dataTransfer.effectAllowed = 'move'
          e.currentTarget.style.opacity = '0.35'
        } : undefined}
        onDragEnd={editMode ? (e) => { e.currentTarget.style.opacity = '' } : undefined}
        style={{
          background:  checked && !editMode ? `${c}0b` : 'var(--surface)',
          border:      `1px solid ${checked && !editMode ? c + '28' : 'var(--border)'}`,
          transition:  'background 0.3s, border-color 0.3s, box-shadow 0.2s',
          opacity:     checked && !editMode ? 0.65 : 1,
          cursor:      editMode ? (editMode ? 'grab' : 'none') : 'none',
        }}
        onMouseEnter={(e) => {
          if (!checked && !editMode) {
            e.currentTarget.style.background  = `${c}18`
            e.currentTarget.style.borderColor = `${c}50`
            e.currentTarget.style.boxShadow   = `0 0 22px ${c}18, 0 0 8px ${c}0c`
          }
        }}
        onMouseLeave={(e) => {
          if (!editMode) {
            e.currentTarget.style.background  = checked ? `${c}0b` : 'var(--surface)'
            e.currentTarget.style.borderColor = checked ? `${c}28` : 'var(--border)'
            e.currentTarget.style.boxShadow   = 'none'
          }
        }}
      >
        {burst && <div className="scan-flash" aria-hidden="true" />}

        {/* Drag handle (edit mode only) */}
        {editMode && (
          <span className="task-drag-handle" aria-hidden="true">⠿</span>
        )}

        {/* Checkbox (hidden in edit mode) */}
        {!editMode && (
          <div className="flex-shrink-0 flex items-center justify-center rounded-sm transition-all duration-200"
            style={{ width: 16, height: 16,
              background: checked ? c : 'transparent',
              border:     `1.5px solid ${checked ? c : c + '50'}`,
              boxShadow:  checked ? `0 0 10px ${c}90, 0 0 22px ${c}40` : 'none' }}>
            {checked && (
              <svg width="8" height="7" viewBox="0 0 8 7" fill="none" aria-hidden="true">
                <path d="M1 3.5L3 5.5L7 1" stroke="#000" strokeWidth="1.6"
                      strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        )}

        {/* Subject badge / edit-mode subject picker */}
        {editMode ? (
          <select
            value={task.subject}
            onChange={e => { e.stopPropagation(); onUpdate?.({ subject: e.target.value }) }}
            onClick={e => e.stopPropagation()}
            style={{
              background:    'transparent',
              border:        `1px solid ${c}60`,
              borderRadius:  '2px',
              color:          c,
              fontFamily:    'var(--font-display)',
              fontSize:      '0.55rem',
              letterSpacing: '0.08em',
              padding:       '1px 4px',
              flexShrink:    0,
              cursor:        'pointer',
              outline:       'none',
            }}
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}
                style={{ background: '#04040b', color: cat.color }}>
                {cat.label.slice(0, 4).toUpperCase()}
              </option>
            ))}
          </select>
        ) : (
          <span aria-hidden="true"
            style={{ fontFamily: 'var(--font-display)', fontSize: '0.58rem', color: c,
              letterSpacing: '0.08em', flexShrink: 0,
              opacity: checked ? 0.4 : 1, transition: 'opacity 0.3s' }}>
            {tag}
          </span>
        )}

        {/* Label / edit input */}
        {editMode ? (
          <input
            ref={labelRef}
            className="task-edit-input"
            value={editLabel}
            onChange={e => setEditLabel(e.target.value)}
            onBlur={commitLabel}
            onKeyDown={e => {
              e.stopPropagation()
              if (e.key === 'Enter') { commitLabel(); labelRef.current?.blur() }
              if (e.key === 'Escape') { setEditLabel(task.label); labelRef.current?.blur() }
            }}
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 relative text-xs leading-snug"
            style={{ fontFamily: 'var(--font-body)',
              color: checked ? 'rgba(200,200,232,0.28)' : 'var(--text)', transition: 'color 0.4s' }}>
            {task.label}
            <span aria-hidden="true"
              style={{ position: 'absolute', top: '50%', left: 0, height: '1.5px',
                transform: 'translateY(-50%)', borderRadius: 1, pointerEvents: 'none',
                background: `linear-gradient(90deg, ${c}, ${c}55)`,
                boxShadow: `0 0 6px ${c}`,
                width: checked ? '100%' : '0%',
                transition: 'width 0.48s cubic-bezier(0.4, 0, 0.2, 1) 0.06s' }} />
          </span>
        )}

        {/* Delete button (edit mode only) */}
        {editMode && (
          <button
            onClick={e => { e.stopPropagation(); onDelete?.() }}
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)',
              fontSize: '0.9rem', lineHeight: 1, padding: '0 2px', flexShrink: 0,
              cursor: 'pointer', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ff3cac'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
            aria-label="Delete task"
          >
            ×
          </button>
        )}
      </div>
    </>
  )
}
