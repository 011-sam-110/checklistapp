'use client'

import { useState, useEffect } from 'react'
import { createChecklist, generateId, DEFAULT_CATEGORIES } from '@/lib/defaultData'

const STORAGE_KEY = 'backontrack-v3'
const OLD_KEY     = 'backontrack-v2'

/* Inject default categories into any checklist that pre-dates the categories field */
function migrate(state) {
  return {
    ...state,
    checklists: state.checklists.map(c =>
      c.categories ? c : { ...c, categories: DEFAULT_CATEGORIES }
    ),
  }
}

function loadInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return migrate(JSON.parse(raw))

    const oldRaw     = localStorage.getItem(OLD_KEY)
    const oldChecked = oldRaw ? JSON.parse(oldRaw) : {}
    if (oldRaw) localStorage.removeItem(OLD_KEY)

    const first = createChecklist('Academic Recovery', 'academic')
    first.checked = oldChecked
    return { activeChecklistId: first.id, checklists: [first] }
  } catch {
    const first = createChecklist('Academic Recovery', 'academic')
    return { activeChecklistId: first.id, checklists: [first] }
  }
}

/* ── Internal helper: immutably update the active checklist ── */
function updateActive(setState, fn) {
  setState(prev => ({
    ...prev,
    checklists: prev.checklists.map(c =>
      c.id !== prev.activeChecklistId ? c : fn(c)
    ),
  }))
}

/* ── Slug a string into a safe category id ── */
function slugify(label) {
  return label.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'subject'
}

export function useChecklists() {
  const [state,           setState]           = useState(null)
  const [activeWeekIndex, setActiveWeekIndex] = useState(0)

  useEffect(() => { setState(loadInitialState()) }, [])
  useEffect(() => {
    if (!state) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
  }, [state])

  const activeChecklist = state?.checklists.find(c => c.id === state.activeChecklistId) ?? null

  /* ── Checklist-level ───────────────────────────────────── */
  const setActiveChecklist = (id) => {
    setState(prev => ({ ...prev, activeChecklistId: id }))
    setActiveWeekIndex(0)
  }

  const createChecklistFn = (name, template) => {
    const c = createChecklist(name, template)
    setState(prev => ({ ...prev, activeChecklistId: c.id, checklists: [...prev.checklists, c] }))
    setActiveWeekIndex(0)
  }

  const deleteChecklist = (id) => {
    setState(prev => {
      const next     = prev.checklists.filter(c => c.id !== id)
      const activeId = prev.activeChecklistId === id ? (next[0]?.id ?? null) : prev.activeChecklistId
      return { checklists: next, activeChecklistId: activeId }
    })
    setActiveWeekIndex(0)
  }

  const renameChecklist = (id, name) => {
    setState(prev => ({
      ...prev,
      checklists: prev.checklists.map(c => c.id === id ? { ...c, name } : c),
    }))
  }

  /* ── Task toggle + reset ────────────────────────────────── */
  const toggleTask = (taskId) => {
    updateActive(setState, c => ({ ...c, checked: { ...c.checked, [taskId]: !c.checked[taskId] } }))
  }

  const resetActiveChecked = () => {
    updateActive(setState, c => ({ ...c, checked: {} }))
  }

  /* ── Task CRUD ──────────────────────────────────────────── */
  const addTask = (weekIdx, dayName, label, subject) => {
    updateActive(setState, c => ({
      ...c,
      weeks: c.weeks.map((w, wi) =>
        wi !== weekIdx ? w : {
          ...w,
          days: w.days.map(d =>
            d.day !== dayName ? d : {
              ...d,
              tasks: [...d.tasks, { id: generateId(), label, subject }],
            }
          ),
        }
      ),
    }))
  }

  const deleteTask = (weekIdx, dayName, taskId) => {
    updateActive(setState, c => {
      const newChecked = { ...c.checked }
      delete newChecked[taskId]
      return {
        ...c,
        checked: newChecked,
        weeks: c.weeks.map((w, wi) =>
          wi !== weekIdx ? w : {
            ...w,
            days: w.days.map(d =>
              d.day !== dayName ? d : { ...d, tasks: d.tasks.filter(t => t.id !== taskId) }
            ),
          }
        ),
      }
    })
  }

  const updateTask = (weekIdx, dayName, taskId, patch) => {
    updateActive(setState, c => ({
      ...c,
      weeks: c.weeks.map((w, wi) =>
        wi !== weekIdx ? w : {
          ...w,
          days: w.days.map(d =>
            d.day !== dayName ? d : {
              ...d,
              tasks: d.tasks.map(t => t.id !== taskId ? t : { ...t, ...patch }),
            }
          ),
        }
      ),
    }))
  }

  const moveTask = (taskId, fromDayName, toDayName, weekIdx) => {
    if (fromDayName === toDayName) return
    updateActive(setState, c => {
      const week = c.weeks[weekIdx]
      if (!week) return c
      const task = week.days.find(d => d.day === fromDayName)?.tasks.find(t => t.id === taskId)
      if (!task) return c
      return {
        ...c,
        weeks: c.weeks.map((w, wi) =>
          wi !== weekIdx ? w : {
            ...w,
            days: w.days.map(d => {
              if (d.day === fromDayName) return { ...d, tasks: d.tasks.filter(t => t.id !== taskId) }
              if (d.day === toDayName)   return { ...d, tasks: [...d.tasks, task] }
              return d
            }),
          }
        ),
      }
    })
  }

  /* Balanced distribution: always fills the day with fewest tasks */
  const batchAddTasks = (weekIdx, tasks) => {
    updateActive(setState, c => {
      const week = c.weeks[weekIdx]
      if (!week) return c

      const newDays  = week.days.map(d => ({ ...d, tasks: [...d.tasks] }))
      const counts   = newDays.map(d => d.tasks.length)

      tasks.forEach(({ label, subject }) => {
        const minCount = Math.min(...counts)
        const minIdx   = counts.indexOf(minCount)
        newDays[minIdx].tasks.push({ id: generateId(), label, subject })
        counts[minIdx]++
      })

      return {
        ...c,
        weeks: c.weeks.map((w, wi) => wi !== weekIdx ? w : { ...w, days: newDays }),
      }
    })
  }

  /* ── Category CRUD ──────────────────────────────────────── */
  const addCategory = (label, color) => {
    updateActive(setState, c => {
      let id = slugify(label)
      const existing = (c.categories ?? []).map(cat => cat.id)
      let suffix = 2
      while (existing.includes(id)) { id = `${slugify(label)}-${suffix++}` }
      return { ...c, categories: [...(c.categories ?? []), { id, label, color }] }
    })
  }

  const deleteCategory = (categoryId) => {
    updateActive(setState, c => {
      const remaining = (c.categories ?? []).filter(cat => cat.id !== categoryId)
      const fallback  = remaining[0]?.id ?? 'general'
      return {
        ...c,
        categories: remaining,
        weeks: c.weeks.map(w => ({
          ...w,
          days: w.days.map(d => ({
            ...d,
            tasks: d.tasks.map(t => t.subject === categoryId ? { ...t, subject: fallback } : t),
          })),
        })),
      }
    })
  }

  const updateCategory = (categoryId, patch) => {
    updateActive(setState, c => ({
      ...c,
      categories: (c.categories ?? []).map(cat =>
        cat.id !== categoryId ? cat : { ...cat, ...patch }
      ),
    }))
  }

  return {
    mounted:            state !== null,
    checklists:         state?.checklists ?? [],
    activeChecklist,
    activeChecklistId:  state?.activeChecklistId ?? null,
    activeWeekIndex,
    setActiveWeekIndex,
    setActiveChecklist,
    createChecklist:    createChecklistFn,
    deleteChecklist,
    renameChecklist,
    toggleTask,
    resetActiveChecked,
    addTask,
    deleteTask,
    updateTask,
    moveTask,
    batchAddTasks,
    addCategory,
    deleteCategory,
    updateCategory,
  }
}
