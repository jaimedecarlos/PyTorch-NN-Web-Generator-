import { LOSS_FUNCTIONS, OPTIMIZER_DEFS } from '../config/layerDefs'

function OptParamField({ name, def, value, onChange }) {
  if (def.type === 'boolean') {
    return (
      <div className="opt-param-field">
        <label>{def.label}</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 4 }}>
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
  return (
    <div className="opt-param-field">
      <label>{def.label}</label>
      <input
        type="number"
        value={value}
        min={def.min ?? undefined}
        max={def.max ?? undefined}
        step={def.step ?? 'any'}
        onChange={e => {
          const v = parseFloat(e.target.value)
          if (!isNaN(v)) onChange(v)
        }}
      />
    </div>
  )
}

export default function TrainingConfig({
  lossFn, setLossFn,
  optimizer, setOptimizer,
  optimizerParams, setOptimizerParams,
  gradientClip, setGradientClip,
}) {
  const optDef = OPTIMIZER_DEFS[optimizer] || {}

  const handleOptimizerChange = (newOpt) => {
    setOptimizer(newOpt)
    // Reset params to defaults for new optimizer
    const newDef = OPTIMIZER_DEFS[newOpt] || {}
    const defaults = Object.fromEntries(
      Object.entries(newDef).map(([k, v]) => [k, v.default])
    )
    setOptimizerParams(defaults)
  }

  const updateOptParam = (key, val) => {
    setOptimizerParams(prev => ({ ...prev, [key]: val }))
  }

  return (
    <div className="section">
      <div className="section-title">Training Config</div>

      <div className="form-row">
        <label>Loss Function</label>
        <select value={lossFn} onChange={e => setLossFn(e.target.value)} style={{ flex: 1, padding: '4px 8px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: 12, background: 'var(--surface)', color: 'var(--text)' }}>
          {LOSS_FUNCTIONS.map(fn => (
            <option key={fn} value={fn}>{fn}</option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <label>Optimizer</label>
        <select
          value={optimizer}
          onChange={e => handleOptimizerChange(e.target.value)}
          style={{ flex: 1, padding: '4px 8px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: 12, background: 'var(--surface)', color: 'var(--text)' }}
        >
          {Object.keys(OPTIMIZER_DEFS).map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {Object.keys(optDef).length > 0 && (
        <div className="optimizer-params">
          <div className="optimizer-params-title">{optimizer} Parameters</div>
          <div className="opt-param-grid">
            {Object.entries(optDef).map(([key, def]) => (
              <OptParamField
                key={key}
                name={key}
                def={def}
                value={optimizerParams[key] ?? def.default}
                onChange={val => updateOptParam(key, val)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="gradient-clip-row">
        <label>
          <input
            type="checkbox"
            checked={gradientClip !== null}
            onChange={e => setGradientClip(e.target.checked ? 1.0 : null)}
          />
          Gradient Clipping
        </label>
        {gradientClip !== null && (
          <>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>max_norm =</span>
            <input
              type="number"
              min={0.01}
              step={0.1}
              value={gradientClip}
              onChange={e => {
                const v = parseFloat(e.target.value)
                if (!isNaN(v) && v > 0) setGradientClip(v)
              }}
            />
          </>
        )}
      </div>
    </div>
  )
}
