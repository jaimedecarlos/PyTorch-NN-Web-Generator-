export default function CodePreview({ code, errors, isValidating, isGenerating, onValidate, onGenerate }) {
  const showValidation = errors !== null
  const hasErrors = showValidation && errors.length > 0

  const handleCopy = () => {
    if (code) navigator.clipboard.writeText(code)
  }

  return (
    <>
      <div className="code-toolbar">
        <span className="code-toolbar-title">Generated Code</span>
        <button
          className="btn btn-secondary btn-sm"
          onClick={onValidate}
          disabled={isValidating}
        >
          {isValidating ? 'Validating…' : 'Validate'}
        </button>
        {code && (
          <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
            Copy
          </button>
        )}
        <button
          className="btn btn-success btn-sm"
          onClick={onGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating…' : '↓ Generate & Download'}
        </button>
      </div>

      {showValidation && (
        <div className={`validation-panel ${hasErrors ? 'error' : 'ok'}`}>
          <div className="validation-header">
            {hasErrors ? `✗ ${errors.length} validation error${errors.length > 1 ? 's' : ''}` : '✓ Architecture is valid'}
          </div>
          {hasErrors && (
            <div className="validation-errors">
              {errors.map((e, i) => (
                <div key={i} className="validation-error-item">{e}</div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="code-area">
        {code ? (
          <pre>{code}</pre>
        ) : (
          <div className="code-placeholder">
            Click <strong>Generate &amp; Download</strong> to produce your PyTorch model file.
          </div>
        )}
      </div>
    </>
  )
}
