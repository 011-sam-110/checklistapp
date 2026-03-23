'use client'

import TaskItem from './TaskItem'

const dayAccent = {
  Monday:    'from-violet-500/20 to-transparent',
  Tuesday:   'from-blue-500/20 to-transparent',
  Wednesday: 'from-teal-500/20 to-transparent',
  Thursday:  'from-indigo-500/20 to-transparent',
  Friday:    'from-pink-500/20 to-transparent',
}

export default function DayColumn({ dayData, checked, onToggle }) {
  const total = dayData.tasks.length
  const done = dayData.tasks.filter(t => checked[t.id]).length
  const progress = total > 0 ? (done / total) * 100 : 0
  const accent = dayAccent[dayData.day] || 'from-white/10 to-transparent'

  return (
    <div className="flex flex-col min-w-[180px] flex-1">
      {/* Day header */}
      <div className={`mb-3 px-3 py-2 rounded-xl bg-gradient-to-b ${accent} border border-white/10`}>
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">
          {dayData.day}
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-white/50 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-white/40 tabular-nums">{done}/{total}</span>
        </div>
      </div>

      {/* Tasks */}
      <div className="flex flex-col gap-2">
        {dayData.tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            checked={!!checked[task.id]}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  )
}
