const express = require("express")
const Room = require("../models/Room")

const router = express.Router()

// POST /api/rooms/join - Join or create a room
router.post("/join", async (req, res) => {
  try {
    const { roomId } = req.body

    if (!roomId || typeof roomId !== "string") {
      return res.status(400).json({ error: "Invalid room ID" })
    }

    const normalizedRoomId = roomId.toUpperCase().trim()

    // Validate room ID format (6-8 alphanumeric characters)
    if (!/^[A-Z0-9]{6,8}$/.test(normalizedRoomId)) {
      return res.status(400).json({ error: "Room ID must be 6-8 alphanumeric characters" })
    }

    // Check if room exists, create if it doesn't
    let room = await Room.findOne({ roomId: normalizedRoomId })

    if (!room) {
      room = new Room({
        roomId: normalizedRoomId,
        drawingData: [],
      })
      await room.save()
    } else {
      // Update last activity
      room.lastActivity = new Date()
      await room.save()
    }

    res.json({ success: true, room: { roomId: room.roomId, createdAt: room.createdAt } })
  } catch (error) {
    console.error("Error joining room:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /api/rooms/:roomId - Get room information
router.get("/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params
    const normalizedRoomId = roomId.toUpperCase().trim()

    const room = await Room.findOne({ roomId: normalizedRoomId })

    if (!room) {
      return res.status(404).json({ error: "Room not found" })
    }

    res.json({
      room: {
        roomId: room.roomId,
        createdAt: room.createdAt,
        lastActivity: room.lastActivity,
        drawingCommandsCount: room.drawingData.length,
      },
    })
  } catch (error) {
    console.error("Error fetching room:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

module.exports = router
