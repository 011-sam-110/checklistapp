'use client'

import { useState } from 'react'
import TaskItem from './TaskItem'

const DAY_TINT = {
  Monday:    'rgba(0,255,204,0.06)',
  Tuesday:   'rgba(255,149,0,0.06)',
  Wednesday: 'rgba(57,255,20,0.06)',
  Thursday:  'rgba(255,60,172,0.06)',
  Friday:    'rgba(0,200,255,0.06)',
}
const DAY_BORDER = {
  Monday:    'rgba(0,255,204,0.15)',
  Tuesday:   'rgba(255,149,0,0.15)',
  Wednesday: 'rgba(57,255,20,0.15)',
  Thursday:  'rgba(255,60,172,0.15)',
  Friday:    'rgba(0,200,255,0.15)',
}
const DAY_GLOW = {
  Monday:    '#00ffcc',
  Tuesday:   '#ff9500',
  Wednesday: '#39ff14',
  Thursday:  '#ff3cac',
  Friday:    '#00c8ff',
}

export default function DayColumn({
  dayData, checked, onToggle,
  editMode = false, weekIdx = 0, categories = [],
  onDeleteTask, onUpdateTask, onMoveTask,
}) {
  const [isDragOver, setIsDragOver] = useState(false)

  const total    = dayData.tasks.length
  const done     = dayData.tasks.filter(t => checked[t.id]).length
  const progress = total > 0 ? (done / total) * 100 : 0
  const allDone  = done === total && total > 0
  const colour   = DAY_GLOW[dayData.day] ?? '#00ffcc'

  /* ── DnD handlers ── */
  const handleDragOver = editMode ? (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  } : undefined

  const handleDragLeave = editMode ? (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setIsDragOver(false)
  } : undefined

  const handleDrop = editMode ? (e) => {
    e.preventDefault()
    setIsDragOver(false)
    try {
      const { taskId, fromDay } = JSON.parse(e.dataTransfer.getData('application/json'))
      if (fromDay !== dayData.day) onMoveTask?.(taskId, fromDay, dayData.day, weekIdx)
    } catch {}
  } : undefined

  return (
    <div
      className={`flex flex-col gap-3 min-w-0 rounded-xl transition-all duration-150 ${isDragOver ? 'is-drag-over' : ''}`}
      style={{ padding: isDragOver ? '4px' : undefined }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* ── Day header ── */}
      <div className="px-3 py-2.5 rounded-lg"
        style={{
          background: DAY_TINT[dayData.day]   ?? 'rgba(255,255,255,0.04)',
          border:    `1px solid ${DAY_BORDER[dayData.day] ?? 'rgba(255,255,255,0.07)'}`,
        }}>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontSize: '1.5rem',
          letterSpacing: '0.06em', lineHeight: 1,
          color:      allDone ? colour : 'rgba(255,255,255,0.45)',
          textShadow: allDone ? `0 0 20px ${colour}` : 'none',
          marginBottom: '0.5rem', transition: 'color 0.4s, text-shadow 0.4s',
        }}>
          {dayData.day.toUpperCase().slice(0, 3)}
          <span style={{ opacity: 0.4, fontSize: '0.9rem' }}>
            {dayData.day.toUpperCase().slice(3)}
          </span>
        </h3>

        <div className="progress-track">
          <div className="progress-fill"
            style={{ width: `${progress}%`, background: colour,
              boxShadow: progress > 0 ? `0 0 8px ${colour}` : 'none', color: colour }} />
        </div>

        <div className="mt-1.5 text-right"
          style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem',
            color: progress === 100 ? colour : 'var(--text-muted)',
            letterSpacing: '0.05em', transition: 'color 0.4s' }}>
          {done}/{total}
        </div>
      </div>

      {/* ── Task list ── */}
      <div className="flex flex-col gap-1.5">
        {dayData.tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            checked={!!checked[task.id]}
            onToggle={onToggle}
            editMode={editMode}
            categories={categories}
            dayName={dayData.day}
            onDelete={() => onDeleteTask?.(weekIdx, dayData.day, task.id)}
            onUpdate={(patch) => onUpdateTask?.(weekIdx, dayData.day, task.id, patch)}
          />
        ))}

        {/* Empty drop zone hint in edit mode */}
        {editMode && dayData.tasks.length === 0 && (
          <div style={{ border: '1px dashed var(--border)', borderRadius: '6px',
            padding: '0.75rem', textAlign: 'center',
            fontFamily: 'var(--font-display)', fontSize: '0.55rem',
            letterSpacing: '0.12em', color: 'var(--text-dim)' }}>
            DROP HERE
          </div>
        )}
      </div>
    </div>
  )
}
