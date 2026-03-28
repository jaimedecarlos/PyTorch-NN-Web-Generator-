import { useState } from 'react'
import { LAYER_DEFS, LAYER_CATEGORIES, ACTIVATIONS } from '../config/layerDefs'

function ShapeField({ def, value, onChange }) {
  const [raw, setRaw] = useState(Array.isArray(value) ? value.join(', ') : String(value))

  const commit = (str) => {
    const parts = str.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0)
    if (parts.length > 0) {
      onChange(parts)
      setRaw(parts.join(', '))
    }
  }

  return (
    <div className="param-field" style={{ gridColumn: '1 / -1' }}>
      <label>{def.label}</label>
      <input
        type="text"
        value={raw}
        placeholder="e.g. 8, 8"
        onChange={e => setRaw(e.target.value)}
        onBlur={e => commit(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') commit(e.target.value) }}
      />
    </div>
  )
}

function ParamField({ def, value, onChange }) {
  if (def.type === 'shape') {
    return <ShapeField def={def} value={value} onChange={onChange} />
  }

  if (def.type === 'boolean') {
    return (
      <div className="param-field">
        <label>{def.label}</label>
        <div className="param-field-inline">
          <input
            type="checkbox"
            checked={!!value}
            onChange={e => onChange(e.target.checked)}
          />
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>{value ? 'true' : 'false'}</span>
        </div>
      </div>
    )
  }

  // number or float
  return (
    <div className="param-field">
      <label>{def.label}</label>
      <input
        type="number"
        value={value}
        min={def.min ?? undefined}
        max={def.max ?? undefined}
        step={def.step ?? (def.type === 'float' ? 'any' : 1)}
        onChange={e => {
          const v = def.type === 'float' ? parseFloat(e.target.value) : parseInt(e.target.value)
          if (!isNaN(v)) onChange(v)
        }}
      />
    </div>
  )
}

export default function LayerCard({ layer, index, total, onUpdate, onDelete, onMoveUp, onMoveDown }) {
  const [expanded, setExpanded] = useState(true)

  const def = LAYER_DEFS[layer.type]
  if (!def) return null

  const category = def.category || 'core'
  const catDef = LAYER_CATEGORIES[category] || LAYER_CATEGORIES.core
  const color = catDef.color

  const updateParam = (paramName, val) => {
    onUpdate({ params: { ...layer.params, [paramName]: val } })
  }

  // Build a short summary for collapsed view
  const summary = Object.entries(layer.params)
    .filter(([, v]) => typeof v === 'number')
    .map(([k, v]) => `${k}=${v}`)
    .slice(0, 3)
    .join(', ')

  return (
    <div className="layer-card">
      <div className="layer-card-header" onClick={() => setExpanded(e => !e)}>
        <span className="layer-index">#{index + 1}</span>
        <span className="layer-type-badge" style={{ background: color }}>
          {layer.type}
        </span>
        {!expanded && (
          <span className="layer-card-title">{summary}</span>
        )}
        {expanded && <span style={{ flex: 1 }} />}
        <div className="layer-card-actions" onClick={e => e.stopPropagation()}>
          <button
            className="icon-btn"
            onClick={onMoveUp}
            disabled={index === 0}
            title="Move up"
          >▲</button>
          <button
            className="icon-btn"
            onClick={onMoveDown}
            disabled={index === total - 1}
            title="Move down"
          >▼</button>
          <button
            className="icon-btn danger"
            onClick={onDelete}
            title="Delete layer"
          >✕</button>
        </div>
      </div>

      {expanded && (
        <div className="layer-card-body">
          <div className="param-grid">
            {Object.entries(def.params).map(([paramName, paramDef]) => (
              <ParamField
                key={paramName}
                name={paramName}
                def={paramDef}
                value={layer.params[paramName] ?? paramDef.default}
                onChange={val => updateParam(paramName, val)}
              />
            ))}
          </div>

          {!def.noActivation && (
            <div className="activation-row">
              <label>Activation</label>
              <select
                value={layer.activation || 'None'}
                onChange={e => onUpdate({ activation: e.target.value })}
              >
                {ACTIVATIONS.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
