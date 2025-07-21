"use client"

const colors = [
  { name: "Black", value: "#000000" },
  { name: "Red", value: "#ef4444" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#22c55e" },
]

const Toolbar = ({ settings, onSettingsChange, socket, roomId }) => {
  const handleColorChange = (color) => {
    onSettingsChange({ ...settings, color })
  }

  const handleStrokeWidthChange = (e) => {
    onSettingsChange({ ...settings, strokeWidth: Number.parseInt(e.target.value) })
  }

  const handleClearCanvas = () => {
    if (socket && roomId) {
      socket.emit("clear-canvas", { roomId })
    }
  }

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        {/* Color Picker */}
        <div>
          <label>Color:</label>
          <div className="color-picker">
            {colors.map((color) => (
              <div
                key={color.value}
                className={`color-option ${settings.color === color.value ? "active" : ""}`}
                style={{ backgroundColor: color.value }}
                onClick={() => handleColorChange(color.value)}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Stroke Width */}
        <div className="stroke-width-control">
          <label>Width:</label>
          <input
            type="range"
            className="stroke-slider"
            min="1"
            max="20"
            value={settings.strokeWidth}
            onChange={handleStrokeWidthChange}
          />
          <span>{settings.strokeWidth}px</span>
        </div>
      </div>

      {/* Clear Button */}
      <button className="btn btn-secondary" onClick={handleClearCanvas}>
        🗑️ Clear Canvas
      </button>
    </div>
  )
}

export default Toolbar
