'use client'

import { useState, useEffect } from 'react'
import { createChecklist } from '@/lib/defaultData'

const STORAGE_KEY = 'backontrack-v3'
const OLD_KEY     = 'backontrack-v2'

function loadInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)

    // Migrate from v2 (v2 only stored checked object, tasks were hard-coded)
    const oldRaw    = localStorage.getItem(OLD_KEY)
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

export function useChecklists() {
  const [state,           setState]           = useState(null)
  const [activeWeekIndex, setActiveWeekIndex] = useState(0)

  // Hydrate from localStorage on mount
  useEffect(() => {
    setState(loadInitialState())
  }, [])

  // Persist any state change
  useEffect(() => {
    if (!state) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
  }, [state])

  /* ── Derived ─────────────────────────────────── */
  const activeChecklist = state?.checklists.find(c => c.id === state.activeChecklistId) ?? null

  /* ── Actions ─────────────────────────────────── */
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
      const activeId = prev.activeChecklistId === id
        ? (next[0]?.id ?? null)
        : prev.activeChecklistId
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

  const toggleTask = (taskId) => {
    setState(prev => ({
      ...prev,
      checklists: prev.checklists.map(c => {
        if (c.id !== prev.activeChecklistId) return c
        return { ...c, checked: { ...c.checked, [taskId]: !c.checked[taskId] } }
      }),
    }))
  }

  const resetActiveChecked = () => {
    setState(prev => ({
      ...prev,
      checklists: prev.checklists.map(c =>
        c.id === prev.activeChecklistId ? { ...c, checked: {} } : c
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
  }
}
