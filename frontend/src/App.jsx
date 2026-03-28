import { useState, useCallback } from 'react'
import InputConfig from './components/InputConfig'
import LayerList from './components/LayerList'
import TrainingConfig from './components/TrainingConfig'
import CodePreview from './components/CodePreview'
import { LAYER_DEFS, OPTIMIZER_DEFS } from './config/layerDefs'

const API = ''  // same origin via vite proxy

let idCounter = 0
const newId = () => `layer_${++idCounter}_${Math.random().toString(36).slice(2, 7)}`

function buildConfig(modelName, inputShape, layers, lossFn, optimizer, optimizerParams, gradientClip) {
  return {
    model_name: modelName,
    input_shape: inputShape,
    layers: layers.map(l => ({
      id: l.id,
      type: l.type,
      params: l.params,
      activation: l.activation || 'None',
    })),
    loss_fn: lossFn,
    optimizer,
    optimizer_params: optimizerParams,
    gradient_clip: gradientClip,
  }
}

export default function App() {
  const [modelName, setModelName] = useState('MyModel')
  const [inputShape, setInputShape] = useState([128])
  const [layers, setLayers] = useState([])
  const [lossFn, setLossFn] = useState('CrossEntropyLoss')
  const [optimizer, setOptimizer] = useState('Adam')
  const [optimizerParams, setOptimizerParams] = useState(
    Object.fromEntries(Object.entries(OPTIMIZER_DEFS.Adam).map(([k, v]) => [k, v.default]))
  )
  const [gradientClip, setGradientClip] = useState(null)

  const [code, setCode] = useState('')
  const [errors, setErrors] = useState(null)
  const [isValidating, setIsValidating] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // ── Layer management ──────────────────────────────────────────────────

  const addLayer = useCallback((type) => {
    const def = LAYER_DEFS[type]
    if (!def) return
    const params = Object.fromEntries(
      Object.entries(def.params).map(([k, v]) => [k, v.default])
    )
    setLayers(prev => [...prev, { id: newId(), type, params, activation: 'None' }])
  }, [])

  const updateLayer = useCallback((id, updates) => {
    setLayers(prev =>
      prev.map(l => l.id === id ? { ...l, ...updates, params: { ...l.params, ...(updates.params || {}) } } : l)
    )
  }, [])

  const deleteLayer = useCallback((id) => {
    setLayers(prev => prev.filter(l => l.id !== id))
  }, [])

  const moveLayer = useCallback((idx, direction) => {
    setLayers(prev => {
      const next = [...prev]
      const target = idx + direction
      if (target < 0 || target >= next.length) return prev
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }, [])

  // ── API calls ─────────────────────────────────────────────────────────

  const handleValidate = async () => {
    setIsValidating(true)
    setErrors(null)
    try {
      const res = await fetch(`${API}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildConfig(modelName, inputShape, layers, lossFn, optimizer, optimizerParams, gradientClip)),
      })
      const data = await res.json()
      setErrors(data.errors || [])
    } catch (e) {
      setErrors([`Could not reach backend: ${e.message}`])
    } finally {
      setIsValidating(false)
    }
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch(`${API}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildConfig(modelName, inputShape, layers, lossFn, optimizer, optimizerParams, gradientClip)),
      })
      const data = await res.json()
      const generatedCode = data.code || ''
      setCode(generatedCode)

      // Trigger download
      const blob = new Blob([generatedCode], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const safeName = (modelName || 'model').replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()
      a.href = url
      a.download = `${safeName}.py`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setErrors([`Could not reach backend: ${e.message}`])
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div>
      <header className="app-header">
        <h1>PyTorch Network Generator</h1>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>
          {layers.length} layer{layers.length !== 1 ? 's' : ''}
        </span>
      </header>

      <div className="app-body">
        <div className="panel-left">
          <InputConfig
            modelName={modelName}
            setModelName={setModelName}
            inputShape={inputShape}
            setInputShape={setInputShape}
          />

          <LayerList
            layers={layers}
            onAdd={addLayer}
            onUpdate={updateLayer}
            onDelete={deleteLayer}
            onMoveUp={idx => moveLayer(idx, -1)}
            onMoveDown={idx => moveLayer(idx, 1)}
          />

          <TrainingConfig
            lossFn={lossFn}
            setLossFn={setLossFn}
            optimizer={optimizer}
            setOptimizer={setOptimizer}
            optimizerParams={optimizerParams}
            setOptimizerParams={setOptimizerParams}
            gradientClip={gradientClip}
            setGradientClip={setGradientClip}
          />
        </div>

        <div className="panel-right">
          <CodePreview
            code={code}
            errors={errors}
            isValidating={isValidating}
            isGenerating={isGenerating}
            onValidate={handleValidate}
            onGenerate={handleGenerate}
          />
        </div>
      </div>
    </div>
  )
}
