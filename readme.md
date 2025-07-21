# Collaborative Whiteboard Application

A real-time collaborative whiteboard built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and Socket.io for live collaboration.

## Features

- **Room Management**: Join rooms with simple alphanumeric codes (6-8 characters)
- **Real-time Drawing**: Smooth drawing with adjustable stroke width and color selection
- **Live Collaboration**: Real-time cursor tracking and drawing synchronization
- **User Presence**: Display active user count in each room
- **Persistent Storage**: Drawing data saved to MongoDB for room persistence

## Technology Stack

- **Frontend**: React.js with styled-components
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.io for WebSocket communication
- **Styling**: CSS with responsive design

## Project Structure

\`\`\`
project-root/
├── client/                 // React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── RoomJoin.js
│   │   │   ├── Whiteboard.js
│   │   │   ├── DrawingCanvas.js
│   │   │   ├── Toolbar.js
│   │   │   └── UserCursors.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── public/
│   └── package.json
├── server/                 // Node.js backend
│   ├── models/
│   │   └── Room.js
│   ├── routes/
│   │   └── rooms.js
│   ├── socket/
│   │   └── socketHandler.js
│   ├── server.js
│   ├── .env
│   └── package.json
├── README.md
└── package.json
\`\`\`

## Setup Instructions

### Prerequisites

- Node.js 16+ installed
- MongoDB instance (local or cloud)

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd collaborative-whiteboard
   \`\`\`

2. **Install dependencies for all packages**
   \`\`\`bash
   npm run install-deps
   \`\`\`

3. **Environment Setup**
   Create a `.env` file in the `server/` directory:
   \`\`\`env
   MONGODB_URI=mongodb://localhost:27017/whiteboard
   PORT=5000
   NODE_ENV=development
   \`\`\`

4. **Start MongoDB** (if using local instance)
   \`\`\`bash
   mongod
   \`\`\`

5. **Run the application**
   \`\`\`bash
   # Run both client and server concurrently
   npm run dev
   
   # Or run separately:
   # Terminal 1 - Server
   npm run server
   
   # Terminal 2 - Client
   npm run client
   \`\`\`

6. **Access the application**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend: [http://localhost:5000](http://localhost:5000)

## API Documentation

### REST Endpoints

#### POST /api/rooms/join
Join or create a room
- **Body**: `{ "roomId": "ROOM123" }`
- **Response**: `{ "success": true, "room": {...} }`
- **Validation**: Room ID must be 6-8 alphanumeric characters

#### GET /api/rooms/:roomId
Get room information
- **Response**: `{ "room": {...} }`
- **Error**: 404 if room not found

#### GET /api/health
Health check endpoint
- **Response**: `{ "status": "OK", "timestamp": "..." }`

### Socket Events

#### Client to Server Events
- `join-room`: Join a specific room
  - **Data**: `roomId` (string)
- `leave-room`: Leave current room
  - **Data**: `roomId` (string)
- `cursor-move`: Send cursor position updates
  - **Data**: `{ x, y, roomId }`
- `draw-start`: Start drawing stroke
  - **Data**: `{ roomId, x, y, color, strokeWidth }`
- `draw-move`: Send drawing path data
  - **Data**: `{ roomId, path, color, strokeWidth }`
- `draw-end`: End drawing stroke
  - **Data**: `{ roomId }`
- `clear-canvas`: Clear entire canvas
  - **Data**: `{ roomId }`

#### Server to Client Events
- `user-count`: Receive active user count
  - **Data**: `count` (number)
- `cursor-update`: Receive other users' cursor positions
  - **Data**: `{ x, y, userId }`
- `user-left`: Notification when user leaves
  - **Data**: `userId` (string)
- `draw-data`: Receive drawing data from other users
  - **Data**: Drawing command object
- `canvas-cleared`: Canvas cleared by another user
- `room-history`: Receive drawing history when joining room
  - **Data**: Array of drawing commands

## Architecture Overview

\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │◄──►│  Express Server │◄──►│    MongoDB      │
│                 │    │                 │    │                 │
│ - Canvas        │    │ - REST API      │    │ - Rooms         │
│ - Socket.io     │    │ - Socket.io     │    │ - Drawing Data  │
│ - UI Components │    │ - Real-time     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
\`\`\`

### Database Schema

#### Room Collection
\`\`\`javascript
{
  roomId: String,        // Unique room identifier (6-8 chars)
  createdAt: Date,       // Room creation timestamp
  lastActivity: Date,    // Last activity in room
  drawingData: [         // Array of drawing commands
    {
      type: String,      // 'stroke' or 'clear'
      data: Object,      // Drawing data (path, color, width)
      timestamp: Date    // Command timestamp
    }
  ]
}
\`\`\`

## Performance Considerations

- **Cursor Throttling**: Cursor updates throttled to ~60fps to prevent server overload
- **Incremental Updates**: Drawing data sent as small incremental updates, not entire canvas
- **Data Compression**: Efficient path storage for large canvases
- **Room Cleanup**: Automatic cleanup of inactive rooms (24+ hours via MongoDB TTL)
- **Memory Management**: Room user tracking cleaned up on disconnect

## Deployment Guide

### Development Deployment

1. **Local MongoDB**
   \`\`\`bash
   # Install MongoDB locally
   brew install mongodb/brew/mongodb-community
   brew services start mongodb/brew/mongodb-community
   \`\`\`

2. **Environment Variables**
   \`\`\`env
   MONGODB_URI=mongodb://localhost:27017/whiteboard
   PORT=5000
   \`\`\`

### Production Deployment

#### Option 1: Heroku + MongoDB Atlas

1. **MongoDB Atlas Setup**
   - Create MongoDB Atlas cluster
   - Get connection string
   - Whitelist all IPs (0.0.0.0/0) for Heroku

2. **Heroku Deployment**
   \`\`\`bash
   # Install Heroku CLI
   npm install -g heroku
   
   # Login and create app
   heroku login
   heroku create your-whiteboard-app
   
   # Set environment variables
   heroku config:set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/whiteboard"
   
   # Deploy
   git push heroku main
   \`\`\`

3. **Frontend Deployment (Netlify/Vercel)**
   - Build the React app: `cd client && npm run build`
   - Deploy the `build` folder to Netlify or Vercel
   - Update API URLs to point to Heroku backend

#### Option 2: VPS Deployment

1. **Server Setup**
   \`\`\`bash
   # Install Node.js, MongoDB, PM2
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs mongodb
   npm install -g pm2
   \`\`\`

2. **Application Deployment**
   \`\`\`bash
   # Clone and setup
   git clone <repository-url>
   cd collaborative-whiteboard
   npm run install-deps
   
   # Start with PM2
   cd server
   pm2 start server.js --name "whiteboard-server"
   
   cd ../client
   npm run build
   # Serve build folder with nginx or serve
   \`\`\`

3. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           root /path/to/client/build;
           try_files $uri $uri/ /index.html;
       }
       
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
       
       location /socket.io {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
       }
   }
   \`\`\`

## Usage

1. **Create/Join Room**: Enter a room code (6-8 characters) or generate a new one
2. **Drawing**: Use the pencil tool with adjustable width (1-20px) and color selection
3. **Collaboration**: See other users' cursors and drawings in real-time
4. **Clear Canvas**: Use the clear button to reset the whiteboard for all users

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running locally or check Atlas connection string
   - Verify network access and credentials

2. **Socket.io Connection Issues**
   - Check CORS configuration in server
   - Verify client is connecting to correct server URL

3. **Canvas Not Responsive**
   - Check canvas resize logic in useEffect
   - Ensure parent container has proper dimensions

4. **Drawing Not Syncing**
   - Verify socket events are properly emitted and received
   - Check MongoDB write operations in server logs

### Debug Mode

Enable debug logging:
\`\`\`bash
# Server
DEBUG=socket.io:* npm run dev

# Client
# Add to browser console
localStorage.debug = 'socket.io-client:*'
