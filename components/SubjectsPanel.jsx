'use client'

import { useRef } from 'react'

export default function SubjectsPanel({ categories, onAdd, onUpdate, onDelete }) {
  return (
    <div className="subjects-panel">

      {categories.map(cat => (
        <CategoryCard
          key={cat.id}
          cat={cat}
          onUpdate={(patch) => onUpdate(cat.id, patch)}
          onDelete={() => onDelete(cat.id)}
          canDelete={categories.length > 1}
        />
      ))}

      {/* Add subject card */}
      <button
        onClick={() => onAdd('New Subject', '#00ffcc')}
        className="category-card"
        style={{ alignItems: 'center', justifyContent: 'center', cursor: 'none',
          border: '1px dashed var(--border)', background: 'transparent',
          color: 'var(--text-dim)', fontSize: '1.25rem', minHeight: '72px' }}
      >
        +
      </button>
    </div>
  )
}

function CategoryCard({ cat, onUpdate, onDelete, canDelete }) {
  const colorRef = useRef(null)

  return (
    <div className="category-card" style={{ borderColor: `${cat.color}30` }}>
      {/* Color swatch + hidden picker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div
          onClick={() => colorRef.current?.click()}
          style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
            background: cat.color, boxShadow: `0 0 8px ${cat.color}80`,
            cursor: 'pointer' }}
        />
        <input
          ref={colorRef}
          type="color"
          value={cat.color}
          onChange={e => onUpdate({ color: e.target.value })}
          style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
          tabIndex={-1}
        />

        {/* Label input */}
        <input
          value={cat.label}
          onChange={e => onUpdate({ label: e.target.value })}
          style={{ flex: 1, background: 'transparent', border: 'none',
            borderBottom: `1px solid ${cat.color}40`, color: cat.color,
            fontFamily: 'var(--font-display)', fontSize: '0.7rem',
            letterSpacing: '0.1em', outline: 'none', minWidth: 0 }}
        />

        {/* Delete */}
        {canDelete && (
          <button
            onClick={onDelete}
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)',
              fontSize: '0.85rem', lineHeight: 1, padding: 0, cursor: 'pointer',
              flexShrink: 0, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ff3cac'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
            aria-label={`Delete ${cat.label}`}
          >
            ×
          </button>
        )}
      </div>

      {/* Subject id hint */}
      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.55rem',
        color: 'var(--text-dim)', letterSpacing: '0.04em' }}>
        id: {cat.id}
      </span>
    </div>
  )
}
