import { weeks as ACADEMIC_WEEKS } from '@/data/tasks'

export { ACADEMIC_WEEKS }

export const BLANK_WEEKS = [
  {
    week: 1,
    days: [
      { day: 'Monday',    tasks: [] },
      { day: 'Tuesday',   tasks: [] },
      { day: 'Wednesday', tasks: [] },
      { day: 'Thursday',  tasks: [] },
      { day: 'Friday',    tasks: [] },
    ],
  },
]

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function createChecklist(name, template = 'academic') {
  return {
    id:        generateId(),
    name,
    createdAt: Date.now(),
    weeks:     template === 'academic' ? ACADEMIC_WEEKS : BLANK_WEEKS,
    checked:   {},
  }
}
