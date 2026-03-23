'use client'

const subjectStyles = {
  dsa: {
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    check: 'accent-purple-400',
    glow: 'hover:shadow-purple-500/20',
  },
  systems: {
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    check: 'accent-blue-400',
    glow: 'hover:shadow-blue-500/20',
  },
  prog: {
    badge: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    check: 'accent-teal-400',
    glow: 'hover:shadow-teal-500/20',
  },
  skills: {
    badge: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    check: 'accent-pink-400',
    glow: 'hover:shadow-pink-500/20',
  },
}

export default function TaskItem({ task, checked, onToggle }) {
  const styles = subjectStyles[task.subject]

  return (
    <label
      className={`
        flex items-start gap-3 p-3 rounded-xl cursor-pointer
        border border-white/5 bg-white/5
        transition-all duration-200
        hover:bg-white/10 hover:shadow-lg ${styles.glow}
        ${checked ? 'opacity-50' : 'opacity-100'}
      `}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(task.id)}
        className={`mt-0.5 w-4 h-4 rounded ${styles.check} flex-shrink-0 cursor-pointer`}
      />
      <span
        className={`
          text-sm font-medium leading-snug transition-all duration-300
          ${checked
            ? 'line-through text-white/30'
            : 'text-white/90'
          }
        `}
      >
        {task.label}
      </span>
    </label>
  )
}
