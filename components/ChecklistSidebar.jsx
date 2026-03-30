'use client'

import { useState } from 'react'

export default function ChecklistSidebar({
  isOpen, onClose,
  checklists, activeChecklistId,
  onSelect, onCreate, onDelete, onRename,
}) {
  const [newName,      setNewName]      = useState('')
  const [newTemplate,  setNewTemplate]  = useState('academic')
  const [renamingId,   setRenamingId]   = useState(null)
  const [renameValue,  setRenameValue]  = useState('')

  const handleCreate = () => {
    const name = newName.trim()
    if (!name) return
    onCreate(name, newTemplate)
    setNewName('')
    onClose()
  }

  const startRename = (c) => {
    setRenamingId(c.id)
    setRenameValue(c.name)
  }

  const confirmRename = () => {
    if (renameValue.trim()) onRename(renamingId, renameValue.trim())
    setRenamingId(null)
  }

  const handleDelete = (e, id) => {
    e.stopPropagation()
    onDelete(id)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`sidebar-backdrop ${isOpen ? 'is-open' : ''}`}
        onClick={onClose}
      />

      {/* Panel */}
      <aside className={`sidebar-panel ${isOpen ? 'is-open' : ''}`}>

        {/* Header */}
        <div className="sidebar-header">
          <span style={{
            fontFamily:    'var(--font-display)',
            letterSpacing: '0.2em',
            color:         '#00ffcc',
            fontSize:      '0.85rem',
            textShadow:    '0 0 10px #00ffcc60',
          }}>
            CHECKLISTS
          </span>
          <button className="sidebar-close-btn" onClick={onClose}>×</button>
        </div>

        {/* List */}
        <ul className="sidebar-list">
          {checklists.map(c => {
            const isActive = c.id === activeChecklistId
            const allTasks = c.weeks?.flatMap(w => w.days.flatMap(d => d.tasks)) ?? []
            const done     = allTasks.filter(t => c.checked?.[t.id]).length

            return (
              <li key={c.id} className={`sidebar-item ${isActive ? 'is-active' : ''}`}>
                {renamingId === c.id ? (
                  <input
                    className="sidebar-rename-input"
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    onBlur={confirmRename}
                    onKeyDown={e => {
                      if (e.key === 'Enter')  confirmRename()
                      if (e.key === 'Escape') setRenamingId(null)
                    }}
                    autoFocus
                  />
                ) : (
                  <button
                    className="sidebar-item-name"
                    onClick={() => { onSelect(c.id); onClose() }}
                    onDoubleClick={() => startRename(c)}
                    title="Click to switch · Double-click to rename"
                  >
                    <span style={{ display: 'block' }}>{c.name}</span>
                    {allTasks.length > 0 && (
                      <span style={{
                        fontSize:      '0.62rem',
                        color:         isActive ? 'rgba(0,255,204,0.5)' : 'var(--text-dim)',
                        letterSpacing: '0.04em',
                        marginTop:     '1px',
                        display:       'block',
                      }}>
                        {done}/{allTasks.length} done
                      </span>
                    )}
                  </button>
                )}

                {checklists.length > 1 && (
                  <button
                    className="sidebar-delete-btn"
                    onClick={e => handleDelete(e, c.id)}
                    title="Delete checklist"
                  >
                    ×
                  </button>
                )}
              </li>
            )
          })}
        </ul>

        <div className="sidebar-divider" />

        {/* New checklist form */}
        <div className="sidebar-new-form">
          <p style={{
            fontFamily:    'var(--font-display)',
            fontSize:      '0.65rem',
            letterSpacing: '0.15em',
            color:         'var(--text-muted)',
            marginBottom:  '0.75rem',
          }}>
            NEW CHECKLIST
          </p>

          <input
            className="sidebar-new-input"
            placeholder="Name..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
          />

          <div className="sidebar-template-btns">
            {[
              { key: 'academic', label: 'ACADEMIC' },
              { key: 'blank',    label: 'BLANK'    },
            ].map(t => (
              <button
                key={t.key}
                className={`sidebar-template-btn ${newTemplate === t.key ? 'is-active' : ''}`}
                onClick={() => setNewTemplate(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            className="sidebar-create-btn"
            onClick={handleCreate}
            disabled={!newName.trim()}
          >
            + CREATE
          </button>
        </div>
      </aside>
    </>
  )
}
