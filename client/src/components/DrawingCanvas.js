"use client"

import { useEffect, useRef, useState, useCallback } from "react"

const DrawingCanvas = ({ socket, roomId, settings, onCursorMove }) => {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPath, setCurrentPath] = useState([])
  const lastEmitTime = useRef(0)
  const drawingBuffer = useRef([])

  // Throttle drawing updates to improve performance
  const throttleDelay = 16 // ~60fps

  useEffect(() => {
    if (!socket) return

    socket.on("draw-data", (drawData) => {
      drawOnCanvas(drawData)
    })

    socket.on("canvas-cleared", () => {
      clearCanvas()
    })

    socket.on("room-history", (history) => {
      // Replay drawing history when joining room
      clearCanvas()
      history.forEach((command) => {
        if (command.type === "stroke") {
          drawOnCanvas(command.data)
        } else if (command.type === "clear") {
          clearCanvas()
        }
      })
    })

    return () => {
      socket.off("draw-data")
      socket.off("canvas-cleared")
      socket.off("room-history")
    }
  }, [socket])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (!container) return

      // Store current drawing before resize
      const imageData = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height)

      canvas.width = container.clientWidth
      canvas.height = container.clientHeight

      // Restore drawing after resize
      canvas.getContext("2d").putImageData(imageData, 0, 0)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  const getCanvasCoordinates = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }, [])

  const drawOnCanvas = useCallback((drawData) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.strokeStyle = drawData.color
    ctx.lineWidth = drawData.strokeWidth
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    if (drawData.type === "start") {
      ctx.beginPath()
      ctx.moveTo(drawData.x, drawData.y)
    } else if (drawData.type === "move" && drawData.path && drawData.path.length > 1) {
      ctx.beginPath()
      const path = drawData.path
      ctx.moveTo(path[0].x, path[0].y)

      // Use quadratic curves for smoother lines
      for (let i = 1; i < path.length - 1; i++) {
        const xc = (path[i].x + path[i + 1].x) / 2
        const yc = (path[i].y + path[i + 1].y) / 2
        ctx.quadraticCurveTo(path[i].x, path[i].y, xc, yc)
      }

      // Draw the last point
      if (path.length > 1) {
        const lastPoint = path[path.length - 1]
        ctx.lineTo(lastPoint.x, lastPoint.y)
      }

      ctx.stroke()
    }
  }, [])

  const drawLocalPath = useCallback(
    (path) => {
      const canvas = canvasRef.current
      if (!canvas || path.length < 2) return

      const ctx = canvas.getContext("2d")
      ctx.strokeStyle = settings.color
      ctx.lineWidth = settings.strokeWidth
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      ctx.beginPath()
      ctx.moveTo(path[0].x, path[0].y)

      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y)
      }

      ctx.stroke()
    },
    [settings],
  )

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }, [])

  const emitDrawingData = useCallback(
    (type, data) => {
      if (!socket) return

      const now = Date.now()
      if (now - lastEmitTime.current < throttleDelay) {
        // Buffer the data if we're emitting too frequently
        drawingBuffer.current.push({ type, data })
        return
      }

      lastEmitTime.current = now
      socket.emit(`draw-${type}`, {
        roomId,
        ...data,
      })

      // Emit any buffered data
      if (drawingBuffer.current.length > 0) {
        const bufferedData = drawingBuffer.current.pop() // Get the latest buffered data
        drawingBuffer.current = []
        setTimeout(() => {
          socket.emit(`draw-${bufferedData.type}`, {
            roomId,
            ...bufferedData.data,
          })
        }, throttleDelay)
      }
    },
    [socket, roomId, throttleDelay],
  )

  const handleMouseDown = useCallback(
    (e) => {
      setIsDrawing(true)
      const coords = getCanvasCoordinates(e)
      const newPath = [coords]
      setCurrentPath(newPath)

      // Draw locally immediately for responsiveness
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      ctx.strokeStyle = settings.color
      ctx.lineWidth = settings.strokeWidth
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.beginPath()
      ctx.moveTo(coords.x, coords.y)

      emitDrawingData("start", {
        type: "start",
        x: coords.x,
        y: coords.y,
        color: settings.color,
        strokeWidth: settings.strokeWidth,
      })
    },
    [getCanvasCoordinates, settings, emitDrawingData],
  )

  const handleMouseMove = useCallback(
    (e) => {
      const coords = getCanvasCoordinates(e)
      onCursorMove(coords.x, coords.y)

      if (!isDrawing) return

      setCurrentPath((prev) => {
        const newPath = [...prev, coords]

        // Draw locally immediately
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        ctx.lineTo(coords.x, coords.y)
        ctx.stroke()

        // Emit to other clients (throttled)
        emitDrawingData("move", {
          type: "move",
          path: newPath,
          color: settings.color,
          strokeWidth: settings.strokeWidth,
        })

        return newPath
      })
    },
    [getCanvasCoordinates, onCursorMove, isDrawing, settings, emitDrawingData],
  )

  const handleMouseUp = useCallback(() => {
    if (!isDrawing) return

    setIsDrawing(false)
    setCurrentPath([])

    if (socket) {
      socket.emit("draw-end", { roomId })
    }
  }, [isDrawing, socket, roomId])

  const handleMouseLeave = useCallback(() => {
    if (isDrawing) {
      handleMouseUp()
    }
  }, [isDrawing, handleMouseUp])

  return (
    <canvas
      ref={canvasRef}
      className="drawing-canvas"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    />
  )
}

export default DrawingCanvas
