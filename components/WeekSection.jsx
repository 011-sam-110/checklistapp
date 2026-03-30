'use client'

import DayColumn from './DayColumn'

export default function WeekSection({
  weekData, checked, onToggle,
  editMode = false, weekIdx = 0, categories = [],
  onDeleteTask, onUpdateTask, onMoveTask,
}) {
  const allTasks = weekData.days.flatMap(d => d.tasks)
  const total    = allTasks.length
  const done     = allTasks.filter(t => checked[t.id]).length
  const pct      = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="w-full">

      {/* ── Week-level progress bar ── */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 progress-track">
          <div className="progress-fill"
            style={{ width: `${pct}%`,
              background: 'linear-gradient(90deg, #00ffcc, #3b82f6, #39ff14)',
              color: '#00ffcc', boxShadow: pct > 0 ? '0 0 10px #00ffcc80' : 'none' }} />
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem',
          letterSpacing: '0.08em', whiteSpace: 'nowrap', minWidth: '6rem', textAlign: 'right',
          color: pct === 100 ? '#00ffcc' : 'var(--text-muted)', transition: 'color 0.4s',
          textShadow: pct === 100 ? '0 0 12px #00ffcc' : 'none' }}>
          {done} / {total} · {pct}%
        </span>
      </div>

      {/* ── Day columns grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        {weekData.days.map(day => (
          <DayColumn
            key={day.day}
            dayData={day}
            checked={checked}
            onToggle={onToggle}
            editMode={editMode}
            weekIdx={weekIdx}
            categories={categories}
            onDeleteTask={onDeleteTask}
            onUpdateTask={onUpdateTask}
            onMoveTask={onMoveTask}
          />
        ))}
      </div>
    </div>
  )
}
