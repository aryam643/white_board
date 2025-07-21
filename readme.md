
---

````markdown
# 🖌️ Collaborative Whiteboard

A real-time collaborative whiteboard built with **Node.js**, **Express**, **Socket.io**, **MongoDB**, and **React**.  
This application allows multiple users to draw simultaneously on a shared canvas with instant updates using WebSockets.

![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)
![Built with Socket.io](https://img.shields.io/badge/socket.io-v4-brightgreen)

---

## 📸 Demo

> *(Include an actual GIF or image here if available)*

![Collaborative Whiteboard Demo](./screenshots/demo.gif)

---

## ✨ Features

- 🔄 Real-time whiteboard drawing using WebSockets
- 🧑‍🤝‍🧑 Join rooms with a shared room ID
- 💾 Drawing persists in MongoDB
- 🧹 Clear canvas functionality
- 📜 Drawing history restoration on reconnection
- 👤 User activity tracking

---

## 🔧 Tech Stack

- **Frontend:** React.js, HTML5 Canvas
- **Backend:** Node.js, Express.js, Socket.io
- **Database:** MongoDB with Mongoose

---

## 📂 Project Structure

```plaintext
white_board/
├── client/                 # React frontend
│   └── ...                
├── server/                 # Express backend with Socket.io
│   ├── models/             # Mongoose schemas
│   └── routes/
├── .env
├── package.json
└── README.md
````

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/aryam643/white_board.git
cd white_board
```

### 2. Install Dependencies

```bash
npm run install-deps
```

> ⚠️ Make sure you have MongoDB installed and running on `mongodb://localhost:27017/whiteboard`.

Create a `.env` file in the root and add:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/whiteboard
```

---

## 🛠️ Available Scripts

```bash
npm run install-deps    # Installs both frontend and backend dependencies
npm run dev             # Runs client and server concurrently
npm run client          # Runs React app (frontend only)
npm run server          # Runs backend server only
```

---

## 🌐 Architecture Overview

```plaintext
+-------------+        WebSocket         +-------------+       MongoDB
|   Client A  | <----------------------> |   Server    | <----------------> [Drawing Data]
+-------------+                         +-------------+       (persisted)
        ▲                                     ▲
        |                                     |
        |                                     ▼
+-------------+        WebSocket         +-------------+
|   Client B  | <----------------------> |   Server    |
+-------------+                         +-------------+
```

---

## 🧾 Database Schema

### Room Schema

```js
{
  roomId: String,             // Unique Room Code
  drawingData: [              // Array of drawing commands
    {
      type: String,           // 'draw', 'clear', etc.
      data: Object,
      timestamp: Date
    }
  ],
  lastActivity: Date
}
```

---

## 🧪 Testing

Currently, no automated tests are implemented.
Manual testing can be done by:

* Opening multiple browser tabs
* Joining the same room
* Verifying real-time synchronization

---

## ⚠️ Notes

> ⚠️ Room codes must be 6–8 alphanumeric characters.

> ⚠️ CORS is enabled for local development. Modify CORS config in `server/index.js` if you host frontend separately.

---

## 📜 License

This project is licensed under the [MIT License](./LICENSE).

---
