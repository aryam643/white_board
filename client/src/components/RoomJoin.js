"use client"

import { useState } from "react"

const RoomJoin = ({ onJoinRoom }) => {
  const [roomCode, setRoomCode] = useState("")
  const [isJoining, setIsJoining] = useState(false)

  const generateRoomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setRoomCode(result)
  }

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) return

    setIsJoining(true)
    try {
      const response = await fetch("http://localhost:5001/api/rooms/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomId: roomCode.toUpperCase() }),
      })

      if (response.ok) {
        onJoinRoom(roomCode.toUpperCase())
      } else {
        console.error("Failed to join room")
      }
    } catch (error) {
      console.error("Error joining room:", error)
    } finally {
      setIsJoining(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleJoinRoom()
    }
  }

  return (
    <div className="room-join-container">
      <div className="room-join-card">
        <h1 className="room-join-title">Collaborative Whiteboard</h1>
        <p className="room-join-subtitle">Join an existing room or create a new one to start collaborating</p>

        <input
          type="text"
          className="room-input"
          placeholder="Enter room code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          onKeyPress={handleKeyPress}
          maxLength={8}
        />

        <div>
          <button className="btn btn-primary" onClick={handleJoinRoom} disabled={!roomCode.trim() || isJoining}>
            {isJoining ? "Joining..." : "Join Room"}
          </button>

          <button className="btn btn-secondary" onClick={generateRoomCode}>
            Generate New Code
          </button>
        </div>
      </div>
    </div>
  )
}

export default RoomJoin
