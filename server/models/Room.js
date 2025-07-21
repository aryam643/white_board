const mongoose = require("mongoose")

const drawingCommandSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["stroke", "clear"],
    required: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
  drawingData: [drawingCommandSchema],
})

// Index for automatic cleanup of old rooms
roomSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 86400 }) // 24 hours

module.exports = mongoose.model("Room", roomSchema)
