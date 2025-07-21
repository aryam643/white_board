"use client"

import { useEffect, useState } from "react"
import { io } from "socket.io-client"
import DrawingCanvas from "./DrawingCanvas"
import Toolbar from "./Toolbar"
import UserCursors from "./UserCursors"

const Whiteboard = ({ roomId, onLeaveRoom }) => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [userCount, setUserCount] = useState(0)
  const [cursors, setCursors] = useState([])
  const [drawingSettings, setDrawingSettings] = useState({
    color: "#000000",
    strokeWidth: 2,
  })

  useEffect(() => {
    // Make sure to connect to the correct server port
    const newSocket = io("http://localhost:5001")

    newSocket.on("connect", () => {
      setIsConnected(true)
      newSocket.emit("join-room", roomId)
    })

    newSocket.on("disconnect", () => {
      setIsConnected(false)
    })

    newSocket.on("user-count", (count) => {
      setUserCount(count)
    })

    newSocket.on("cursor-update", (cursorData) => {
      setCursors((prev) => {
        const filtered = prev.filter((c) => c.userId !== cursorData.userId)
        return [...filtered, cursorData]
      })
    })

    newSocket.on("user-left", (userId) => {
      setCursors((prev) => prev.filter((c) => c.userId !== userId))
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [roomId])

  const handleLeaveRoom = () => {
    if (socket) {
      socket.emit("leave-room", roomId)
      socket.close()
    }
    onLeaveRoom()
  }

  const handleCursorMove = (x, y) => {
    if (socket) {
      socket.emit("cursor-move", { x, y, roomId })
    }
  }

  return (
    <div className="whiteboard-container">
      {/* Header */}
      <div className="whiteboard-header">
        <div className="room-info">
          <div className="room-code">Room: {roomId}</div>
          <div className="connection-status">
            <div className={`status-indicator ${isConnected ? "status-connected" : "status-disconnected"}`}></div>
            <span>{isConnected ? "Connected" : "Disconnected"}</span>
          </div>
        </div>

        <div className="user-count">
          <span>
            👥 {userCount} user{userCount !== 1 ? "s" : ""}
          </span>
          <button className="btn btn-secondary" onClick={handleLeaveRoom}>
            Leave Room
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar settings={drawingSettings} onSettingsChange={setDrawingSettings} socket={socket} roomId={roomId} />

      {/* Canvas Area */}
      <div className="canvas-container">
        <DrawingCanvas socket={socket} roomId={roomId} settings={drawingSettings} onCursorMove={handleCursorMove} />
        <UserCursors cursors={cursors} />
      </div>
    </div>
  )
}

export default Whiteboard
