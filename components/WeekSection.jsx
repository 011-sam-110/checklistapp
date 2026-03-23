'use client'

import DayColumn from './DayColumn'

export default function WeekSection({ weekData, checked, onToggle }) {
  const allTasks = weekData.days.flatMap(d => d.tasks)
  const total = allTasks.length
  const done = allTasks.filter(t => checked[t.id]).length
  const progress = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="w-full">
      {/* Week stats bar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #8b5cf6, #3b82f6, #14b8a6)',
            }}
          />
        </div>
        <span className="text-sm font-semibold text-white/60 tabular-nums whitespace-nowrap">
          {done} / {total} done &nbsp;·&nbsp; {progress}%
        </span>
      </div>

      {/* Day columns */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {weekData.days.map(day => (
          <DayColumn
            key={day.day}
            dayData={day}
            checked={checked}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  )
}
