'use client'

import { useState, useEffect } from 'react'
import { useChecklists }   from '@/lib/useChecklists'
import WeekSection         from './WeekSection'
import ChecklistSidebar    from './ChecklistSidebar'
import SubjectsPanel       from './SubjectsPanel'
import TaskBatchPanel      from './TaskBatchPanel'

const WEEK_PALETTE = ['#00ffcc', '#ff9500', '#ff3cac', '#39ff14', '#00c8ff', '#a855f7']

export default function Checklist() {
  const {
    mounted, checklists, activeChecklist, activeChecklistId,
    activeWeekIndex, setActiveWeekIndex,
    setActiveChecklist, createChecklist, deleteChecklist, renameChecklist,
    toggleTask, resetActiveChecked,
    addTask, deleteTask, updateTask, moveTask, batchAddTasks,
    addCategory, deleteCategory, updateCategory,
  } = useChecklists()

  const [sidebarOpen,    setSidebarOpen]    = useState(false)
  const [editMode,       setEditMode]       = useState(false)
  const [batchPanelOpen, setBatchPanelOpen] = useState(false)

  /* ── Inject category colors as CSS vars ── */
  useEffect(() => {
    if (!activeChecklist?.categories) return
    activeChecklist.categories.forEach(cat =>
      document.documentElement.style.setProperty(`--cat-${cat.id}`, cat.color)
    )
  }, [activeChecklist?.categories])

  if (!mounted || !activeChecklist) return null

  const weeks      = activeChecklist.weeks
  const checked    = activeChecklist.checked
  const categories = activeChecklist.categories ?? []
  const safeWeekIdx = Math.min(activeWeekIndex, Math.max(0, weeks.length - 1))

  /* ── Stats ── */
  const allTasks   = weeks.flatMap(w => w.days.flatMap(d => d.tasks))
  const totalDone  = allTasks.filter(t => checked[t.id]).length
  const totalAll   = allTasks.length
  const overallPct = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0

  const weekProgress = weeks.map(w => {
    const tasks = w.days.flatMap(d => d.tasks)
    const done  = tasks.filter(t => checked[t.id]).length
    return { done, total: tasks.length, pct: tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0 }
  })

  return (
    <>
      <ChecklistSidebar
        isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}
        checklists={checklists} activeChecklistId={activeChecklistId}
        onSelect={setActiveChecklist} onCreate={createChecklist}
        onDelete={deleteChecklist} onRename={renameChecklist}
      />

      <TaskBatchPanel
        isOpen={batchPanelOpen} onClose={() => setBatchPanelOpen(false)}
        weekIndex={safeWeekIdx}
        weekLabel={weeks[safeWeekIdx]?.week ?? safeWeekIdx + 1}
        categories={categories}
        onDistribute={batchAddTasks}
      />

      {/* Always-visible sidebar tab */}
      <button className={`sidebar-tab ${editMode ? 'edit-mode-tab' : ''}`}
        onClick={() => setSidebarOpen(true)} aria-label="Open checklists">
        LISTS
      </button>

      <div className={`w-full max-w-7xl mx-auto px-4 py-12 md:py-16 ${editMode ? 'is-editing' : ''}`}>

        {/* ══ HERO HEADER ══ */}
        <header className="mb-12 md:mb-14">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem',
                letterSpacing: '0.25em', color: '#00ffcc', textShadow: '0 0 12px #00ffcc',
                marginBottom: '0.5rem' }}>
                COMMAND CENTRE · {activeChecklist.name.toUpperCase()}
              </p>
              <h1 style={{ fontFamily: 'var(--font-display)',
                fontSize: 'clamp(3rem, 9vw, 7rem)', letterSpacing: '0.04em',
                lineHeight: 0.92, color: '#ffffff',
                textShadow: '0 0 40px rgba(0,255,204,0.12)', marginBottom: '1.5rem' }}>
                {weeks.length}-WEEK<br />
                <span style={{ color: '#00ffcc', textShadow: '0 0 30px #00ffcc, 0 0 60px #00ffcc60' }}>
                  MASTER PLAN
                </span>
              </h1>
            </div>

            {/* Edit mode toggle */}
            <button
              onClick={() => setEditMode(m => !m)}
              style={{
                fontFamily:    'var(--font-display)',
                fontSize:      '0.65rem',
                letterSpacing: '0.18em',
                padding:       '0.5rem 1.1rem',
                borderRadius:  '4px',
                cursor:        'none',
                transition:    'all 0.2s',
                background:    editMode ? 'rgba(255,170,0,0.12)' : 'var(--surface)',
                border:        `1px solid ${editMode ? 'rgba(255,170,0,0.45)' : 'var(--border)'}`,
                color:         editMode ? 'rgba(255,170,0,0.9)' : 'var(--text-muted)',
                textShadow:    editMode ? '0 0 10px rgba(255,170,0,0.5)' : 'none',
                boxShadow:     editMode ? '0 0 16px rgba(255,170,0,0.1)' : 'none',
                marginTop:     '0.25rem',
                flexShrink:    0,
              }}
            >
              {editMode ? '✓ DONE' : 'EDIT'}
            </button>
          </div>

          {/* Stats + legend */}
          <div className="flex flex-wrap items-center gap-6 mb-5">
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem',
              color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
              {totalDone} <span style={{ color: '#00ffcc' }}>completed</span> · {totalAll - totalDone} remaining
            </span>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <span key={cat.id} style={{
                  fontFamily: 'var(--font-display)', fontSize: '0.6rem',
                  letterSpacing: '0.1em', color: cat.color,
                  border: `1px solid ${cat.color}40`, background: `${cat.color}0d`,
                  padding: '2px 10px', borderRadius: '2px',
                  textShadow: `0 0 8px ${cat.color}80` }}>
                  {cat.label.toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          {/* Overall progress bar */}
          <div className="max-w-lg">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${overallPct}%`,
                background: 'linear-gradient(90deg, #00ffcc, #3b82f6, #39ff14, #ff3cac)',
                color: '#00ffcc', boxShadow: overallPct > 0 ? '0 0 12px #00ffcc60' : 'none' }} />
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem',
              color: 'var(--text-dim)', letterSpacing: '0.06em', marginTop: '0.4rem' }}>
              {overallPct}% OVERALL
            </p>
          </div>
        </header>

        {/* ══ SUBJECTS PANEL (edit mode only) ══ */}
        {editMode && (
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem',
              letterSpacing: '0.18em', color: 'rgba(255,170,0,0.7)', marginBottom: '0.25rem' }}>
              SUBJECTS
            </p>
            <SubjectsPanel
              categories={categories}
              onAdd={addCategory}
              onUpdate={updateCategory}
              onDelete={deleteCategory}
            />
          </div>
        )}

        {/* ══ WEEK SELECTOR TABS ══ */}
        <div className="flex flex-wrap gap-3 mb-2">
          {weeks.map((w, i) => {
            const { done, total, pct } = weekProgress[i]
            const active  = safeWeekIdx === i
            const wColour = WEEK_PALETTE[i % WEEK_PALETTE.length]
            return (
              <button key={w.week ?? i}
                onClick={() => setActiveWeekIndex(i)}
                className="relative flex-1 md:flex-none md:min-w-[140px] py-3 px-5 rounded-lg transition-all duration-200"
                style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.08em', cursor: 'none',
                  background:  active ? `${wColour}15` : 'var(--surface)',
                  border:      `1px solid ${active ? wColour + '50' : 'var(--border)'}`,
                  boxShadow:   active ? `0 0 24px ${wColour}18` : 'none',
                  color:       active ? wColour : 'var(--text-muted)',
                  textShadow:  active ? `0 0 12px ${wColour}` : 'none' }}
                onMouseEnter={e => { if (!active) {
                  e.currentTarget.style.background  = `${wColour}0d`
                  e.currentTarget.style.borderColor = `${wColour}30`
                  e.currentTarget.style.color       = 'var(--text)'
                }}}
                onMouseLeave={e => { if (!active) {
                  e.currentTarget.style.background  = 'var(--surface)'
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.color       = 'var(--text-muted)'
                }}}>
                <span style={{ fontSize: '1.1rem', display: 'block' }}>WEEK {w.week ?? i + 1}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.58rem',
                  letterSpacing: '0.04em', display: 'block', marginTop: '0.1rem',
                  color: active ? wColour + 'cc' : 'var(--text-dim)' }}>
                  {done}/{total} · {pct}%
                </span>
              </button>
            )
          })}

          {/* FILL WEEK button — edit mode only */}
          {editMode && weeks.length > 0 && (
            <button
              onClick={() => setBatchPanelOpen(true)}
              style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem',
                letterSpacing: '0.15em', padding: '0.5rem 1rem', borderRadius: '6px',
                background: 'rgba(255,170,0,0.06)', border: '1px solid rgba(255,170,0,0.3)',
                color: 'rgba(255,170,0,0.8)', cursor: 'none', transition: 'all 0.15s',
                alignSelf: 'center' }}
              onMouseEnter={e => {
                e.currentTarget.style.background  = 'rgba(255,170,0,0.12)'
                e.currentTarget.style.borderColor = 'rgba(255,170,0,0.5)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background  = 'rgba(255,170,0,0.06)'
                e.currentTarget.style.borderColor = 'rgba(255,170,0,0.3)'
              }}
            >
              + FILL WEEK
            </button>
          )}
        </div>

        {/* ══ ACTIVE WEEK PANEL ══ */}
        <div style={{ marginTop: '1.5rem' }}>
          {weeks.length > 0 ? (
            <div className="rounded-2xl p-5 md:p-8"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.03) inset, 0 32px 64px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(8px)' }}>
              <WeekSection
                weekData={weeks[safeWeekIdx]}
                checked={checked}
                onToggle={toggleTask}
                editMode={editMode}
                weekIdx={safeWeekIdx}
                categories={categories}
                onDeleteTask={deleteTask}
                onUpdateTask={updateTask}
                onMoveTask={moveTask}
              />
            </div>
          ) : (
            <div className="empty-state">NO WEEKS YET</div>
          )}
        </div>

        {/* ══ RESET ══ */}
        <div className="text-center mt-10">
          <button
            onClick={() => { if (confirm('Reset ALL progress for this checklist?')) resetActiveChecked() }}
            style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem',
              letterSpacing: '0.15em', color: 'var(--text-dim)', background: 'none',
              border: 'none', textDecoration: 'underline', textUnderlineOffset: '4px',
              cursor: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,60,172,0.6)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
          >
            RESET ALL PROGRESS
          </button>
        </div>
      </div>
    </>
  )
}
