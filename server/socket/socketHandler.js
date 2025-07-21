const Room = require("../models/Room")

const socketHandler = (io) => {
  // Store active users per room
  const roomUsers = new Map()

  // Throttling for cursor updates
  const cursorThrottle = new Map()
  const CURSOR_THROTTLE_MS = 50 // 20fps for cursor updates

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id)

    // Join room event
    socket.on("join-room", async (roomId) => {
      try {
        socket.join(roomId)

        // Add user to room tracking
        if (!roomUsers.has(roomId)) {
          roomUsers.set(roomId, new Set())
        }
        roomUsers.get(roomId).add(socket.id)

        // Get room history and send to new user
        const room = await Room.findOne({ roomId })
        if (room && room.drawingData) {
          socket.emit("room-history", room.drawingData)
        }

        // Update user count for all users in room
        const userCount = roomUsers.get(roomId).size
        io.to(roomId).emit("user-count", userCount)

        console.log(`User ${socket.id} joined room ${roomId}. Total users: ${userCount}`)
      } catch (error) {
        console.error("Error joining room:", error)
      }
    })

    // Leave room event
    socket.on("leave-room", (roomId) => {
      socket.leave(roomId)

      // Remove user from room tracking
      if (roomUsers.has(roomId)) {
        roomUsers.get(roomId).delete(socket.id)

        // Clean up empty room tracking
        if (roomUsers.get(roomId).size === 0) {
          roomUsers.delete(roomId)
        } else {
          // Update user count
          const userCount = roomUsers.get(roomId).size
          io.to(roomId).emit("user-count", userCount)
        }
      }

      socket.to(roomId).emit("user-left", socket.id)
      console.log(`User ${socket.id} left room ${roomId}`)
    })

    // Throttled cursor movement event
    socket.on("cursor-move", (data) => {
      const now = Date.now()
      const lastUpdate = cursorThrottle.get(socket.id) || 0

      if (now - lastUpdate > CURSOR_THROTTLE_MS) {
        cursorThrottle.set(socket.id, now)
        socket.to(data.roomId).emit("cursor-update", {
          x: data.x,
          y: data.y,
          userId: socket.id,
        })
      }
    })

    // Optimized drawing events
    socket.on("draw-start", (data) => {
      // Broadcast immediately to other clients
      socket.to(data.roomId).emit("draw-data", data)
    })

    socket.on("draw-move", async (data) => {
      // Broadcast immediately to other clients for real-time feel
      socket.to(data.roomId).emit("draw-data", data)

      // Save to database less frequently to reduce load
      try {
        const drawingCommand = {
          type: "stroke",
          data: data,
          timestamp: new Date(),
        }

        // Use upsert with push to avoid race conditions
        await Room.findOneAndUpdate(
          { roomId: data.roomId },
          {
            $push: { drawingData: drawingCommand },
            $set: { lastActivity: new Date() },
          },
          { upsert: true, new: true },
        )
      } catch (error) {
        console.error("Error saving drawing data:", error)
      }
    })

    socket.on("draw-end", (data) => {
      socket.to(data.roomId).emit("draw-end", data)
    })

// Clear canvas event
socket.on("clear-canvas", async (data) => {
  if (!data || typeof data.roomId !== "string") {
    console.warn("Invalid data received for clear-canvas:", data);
    return;
  }

  // Notify all users in the room
  io.to(data.roomId).emit("canvas-cleared");

  // Clear drawing data in the database
  try {
    const clearCommand = {
      type: "clear",
      data: {},
      timestamp: new Date(),
    };

    await Room.findOneAndUpdate(
      { roomId: data.roomId },
      {
        $set: {
          drawingData: [clearCommand],
          lastActivity: new Date(),
        },
      },
      { upsert: true }
    );
  } catch (error) {
    console.error("Error clearing canvas data:", error);
  }
});


    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id)

      // Clean up cursor throttle
      cursorThrottle.delete(socket.id)

      // Remove user from all room tracking
      for (const [roomId, users] of roomUsers.entries()) {
        if (users.has(socket.id)) {
          users.delete(socket.id)

          // Update user count for remaining users
          if (users.size === 0) {
            roomUsers.delete(roomId)
          } else {
            io.to(roomId).emit("user-count", users.size)
          }

          // Notify other users in room
          socket.to(roomId).emit("user-left", socket.id)
        }
      }
    })
  })
}

module.exports = socketHandler
