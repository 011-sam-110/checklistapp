'use client'

import { useState, useEffect } from 'react'

let _uid = 0
const uid = () => `entry-${++_uid}`

export default function TaskBatchPanel({
  isOpen, onClose, weekIndex, weekLabel, categories, onDistribute,
}) {
  const [entries,         setEntries]         = useState([])
  const [selectedSubject, setSelectedSubject] = useState('')

  /* Reset state whenever the panel opens */
  useEffect(() => {
    if (!isOpen) return
    setEntries([{ id: uid(), label: '' }, { id: uid(), label: '' }, { id: uid(), label: '' }])
    setSelectedSubject(categories[0]?.id ?? '')
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateEntry = (id, label) =>
    setEntries(prev => prev.map(e => e.id === id ? { ...e, label } : e))

  const removeEntry = (id) =>
    setEntries(prev => prev.filter(e => e.id !== id))

  const addEntry = () =>
    setEntries(prev => [...prev, { id: uid(), label: '' }])

  const handleDistribute = () => {
    const tasks = entries
      .map(e => e.label.trim())
      .filter(Boolean)
      .map(label => ({ label, subject: selectedSubject }))
    if (!tasks.length) return
    onDistribute(weekIndex, tasks)
    onClose()
  }

  const hasContent = entries.some(e => e.label.trim())
  const activeCat  = categories.find(c => c.id === selectedSubject)

  return (
    <>
      {/* Backdrop */}
      <div
        className={`sidebar-backdrop ${isOpen ? 'is-open' : ''}`}
        onClick={onClose}
      />

      {/* Panel */}
      <aside className={`batch-panel ${isOpen ? 'is-open' : ''}`}>

        {/* Header */}
        <div className="sidebar-header">
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem',
              letterSpacing: '0.2em', color: 'var(--text-muted)', marginBottom: '2px' }}>
              ADD TASKS
            </p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem',
              letterSpacing: '0.15em', color: '#00ffcc', textShadow: '0 0 10px #00ffcc60' }}>
              WEEK {weekLabel}
            </p>
          </div>
          <button className="sidebar-close-btn" onClick={onClose}>×</button>
        </div>

        {/* Subject selector */}
        <div style={{ padding: '1rem 1.25rem 0' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem',
            letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
            SUBJECT
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`subject-chip ${selectedSubject === cat.id ? 'is-active' : ''}`}
                onClick={() => setSelectedSubject(cat.id)}
                style={selectedSubject === cat.id ? {
                  color:       cat.color,
                  borderColor: `${cat.color}60`,
                  background:  `${cat.color}10`,
                  textShadow:  `0 0 8px ${cat.color}60`,
                } : {}}
              >
                {cat.label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Task inputs */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem',
            letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            TASK NAMES
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {entries.map((entry, i) => (
              <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem',
                  color: 'var(--text-dim)', width: '1.2rem', textAlign: 'right', flexShrink: 0 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <input
                  className="sidebar-new-input"
                  style={{ marginBottom: 0,
                    borderColor: entry.label.trim() && activeCat ? `${activeCat.color}30` : undefined }}
                  placeholder={`Task ${i + 1}...`}
                  value={entry.label}
                  onChange={e => updateEntry(entry.id, e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addEntry()
                    }
                  }}
                  autoFocus={i === entries.length - 1 && entries.length > 3}
                />
                {entries.length > 1 && (
                  <button
                    onClick={() => removeEntry(entry.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-dim)',
                      fontSize: '1rem', lineHeight: 1, padding: '0 2px', cursor: 'pointer',
                      flexShrink: 0, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ff3cac'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={addEntry}
            style={{ marginTop: '0.75rem', background: 'none', border: 'none',
              color: 'var(--text-muted)', fontFamily: 'var(--font-display)',
              fontSize: '0.6rem', letterSpacing: '0.12em', cursor: 'pointer',
              transition: 'color 0.15s', padding: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            + ADD MORE
          </button>
        </div>

        <div className="sidebar-divider" />

        {/* Footer */}
        <div style={{ padding: '1.25rem' }}>
          <button
            className="sidebar-create-btn"
            onClick={handleDistribute}
            disabled={!hasContent || !selectedSubject}
            style={hasContent && activeCat ? {
              background:  `${activeCat.color}10`,
              borderColor: `${activeCat.color}40`,
              color:        activeCat.color,
            } : {}}
          >
            DISTRIBUTE →
          </button>
          <p style={{ marginTop: '0.6rem', fontFamily: 'var(--font-body)', fontSize: '0.58rem',
            color: 'var(--text-dim)', letterSpacing: '0.03em', textAlign: 'center' }}>
            Tasks are balanced across days with fewest items first
          </p>
        </div>
      </aside>
    </>
  )
}
