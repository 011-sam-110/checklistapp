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

export const DEFAULT_CATEGORIES = [
  { id: 'dsa',     label: 'DSA',           color: '#00ffcc' },
  { id: 'systems', label: 'Systems',        color: '#ff9500' },
  { id: 'prog',    label: 'Programming',    color: '#39ff14' },
  { id: 'skills',  label: 'Prof. Skills',   color: '#ff3cac' },
]

export const BLANK_CATEGORIES = [
  { id: 'general', label: 'General', color: '#00ffcc' },
]

export function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function createChecklist(name, template = 'academic') {
  return {
    id:         generateId(),
    name,
    createdAt:  Date.now(),
    categories: template === 'academic' ? DEFAULT_CATEGORIES : BLANK_CATEGORIES,
    weeks:      template === 'academic' ? ACADEMIC_WEEKS : BLANK_WEEKS,
    checked:    {},
  }
}
