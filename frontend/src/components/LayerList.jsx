import { useState } from 'react'
import LayerCard from './LayerCard'
import { LAYER_DEFS, LAYER_CATEGORIES } from '../config/layerDefs'

export default function LayerList({ layers, onAdd, onUpdate, onDelete, onMoveUp, onMoveDown }) {
  const [selectedType, setSelectedType] = useState('Linear')

  const handleAdd = () => {
    if (selectedType) onAdd(selectedType)
  }

  // Group layer types by category for the dropdown
  const grouped = {}
  Object.entries(LAYER_DEFS).forEach(([type, def]) => {
    const cat = def.category || 'core'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push({ type, label: def.label })
  })

  return (
    <div className="section">
      <div className="section-title">Architecture</div>

      {layers.length === 0 && (
        <div style={{ color: 'var(--muted)', fontSize: 12, textAlign: 'center', padding: '16px 0' }}>
          No layers yet. Add a layer below.
        </div>
      )}

      <div className="layer-list">
        {layers.map((layer, idx) => (
          <LayerCard
            key={layer.id}
            layer={layer}
            index={idx}
            total={layers.length}
            onUpdate={updates => onUpdate(layer.id, updates)}
            onDelete={() => onDelete(layer.id)}
            onMoveUp={() => onMoveUp(idx)}
            onMoveDown={() => onMoveDown(idx)}
          />
        ))}
      </div>

      <div className="add-layer-row" style={{ marginTop: layers.length > 0 ? 10 : 0 }}>
        <select value={selectedType} onChange={e => setSelectedType(e.target.value)}>
          {Object.entries(LAYER_CATEGORIES).map(([cat, catDef]) => (
            grouped[cat] ? (
              <optgroup key={cat} label={catDef.label}>
                {grouped[cat].map(({ type, label }) => (
                  <option key={type} value={type}>{label}</option>
                ))}
              </optgroup>
            ) : null
          ))}
        </select>
        <button className="btn btn-primary btn-sm" onClick={handleAdd}>
          + Add Layer
        </button>
      </div>
    </div>
  )
}
