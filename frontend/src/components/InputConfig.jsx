export default function InputConfig({ modelName, setModelName, inputShape, setInputShape }) {
  const updateDim = (idx, val) => {
    const v = parseInt(val)
    if (isNaN(v) || v <= 0) return
    setInputShape(prev => prev.map((d, i) => (i === idx ? v : d)))
  }

  const addDim = () => setInputShape(prev => [...prev, 1])

  const removeDim = (idx) => {
    if (inputShape.length <= 1) return
    setInputShape(prev => prev.filter((_, i) => i !== idx))
  }

  const dimCount = inputShape.length
  const hint =
    dimCount === 1
      ? `Tabular — shape: (batch, ${inputShape[0]})`
      : dimCount === 2
      ? `Sequence — shape: (batch, ${inputShape[0]}, ${inputShape[1]})`
      : dimCount === 3
      ? `Image — shape: (batch, ${inputShape[0]}, ${inputShape[1]}, ${inputShape[2]})`
      : `shape: (batch, ${inputShape.join(', ')})`

  return (
    <div className="section">
      <div className="section-title">Model &amp; Input</div>

      <div className="form-row">
        <label>Model Name</label>
        <input
          type="text"
          className="wide"
          value={modelName}
          onChange={e => setModelName(e.target.value)}
          placeholder="MyModel"
        />
      </div>

      <div className="form-row" style={{ alignItems: 'flex-start' }}>
        <label style={{ paddingTop: 5 }}>Input Shape</label>
        <div style={{ flex: 1 }}>
          <div className="shape-dims">
            {inputShape.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <input
                  type="number"
                  min={1}
                  value={d}
                  onChange={e => updateDim(i, e.target.value)}
                />
                {inputShape.length > 1 && (
                  <button className="dim-remove" onClick={() => removeDim(i)} title="Remove dim">
                    ×
                  </button>
                )}
                {i < inputShape.length - 1 && (
                  <span style={{ color: 'var(--muted)', fontSize: 12 }}>×</span>
                )}
              </div>
            ))}
            <button className="btn btn-secondary btn-sm" onClick={addDim}>
              + Dim
            </button>
          </div>
          <div className="shape-hint">{hint} (excluding batch)</div>
        </div>
      </div>
    </div>
  )
}
