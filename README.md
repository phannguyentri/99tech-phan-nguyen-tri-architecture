# Score Tracking API with Vue 3 Frontend

This is a full-stack application for tracking user scores with real-time updates, built with Node.js, Express, MongoDB, Socket.IO, and Vue 3 + Vite.

## Project Components

### Backend (Node.js + Express + MongoDB)
- RESTful API for user authentication and score management
- Real-time updates with Socket.IO
- MongoDB database for data storage
- JWT authentication for secure API access
- Score validation and leaderboard generation

### Frontend (Vue 3 + Vite)
- Modern Vue 3 application with Composition API
- Fast development with Vite
- Real-time leaderboard updates with Socket.IO
- User authentication with JWT
- Responsive design with intuitive UI
- Tabbed interface for login/register
- Conditional UI elements based on authentication state

## Project Setup

### Backend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend-vite

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Docker Setup

The entire application can be run using Docker and Docker Compose:

```bash
# Build and start all services
docker-compose up

# Build and start in detached mode
docker-compose up -d

# Stop all services
docker-compose down
```

The application will be available at:
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000

## Features

- User authentication (login/register) with tabbed interface
- Automatic tab switching after successful registration
- Score tracking and updates with real-time validation
- Real-time leaderboard updates with Socket.IO
- Responsive design with conditional UI elements
- Modern Vue 3 Composition API implementation
- Dockerized deployment for easy setup
- JWT-based authentication for secure API access
- User dashboard that appears only after authentication
- Logout functionality to return to login screen

## Application Flow

The application follows a structured flow for user interactions:

1. **Authentication Flow**:
   - Users can register with email and password
   - After successful registration, automatically switches to login tab
   - Login validates credentials and generates JWT token
   - JWT token is stored in localStorage for persistent sessions

2. **Score Update Flow**:
   - Authenticated users can update their scores
   - Score changes are validated on the server
   - After validation, the user's score is updated in the database
   - The updated score and leaderboard are returned in the API response
   - The client updates the local UI with the new data

3. **Real-time Updates Flow**:
   - All clients connect to Socket.IO server
   - Clients listen for 'leaderboard' events
   - When a score is updated, the server broadcasts the updated leaderboard
   - All connected clients receive the update and refresh their UI

For detailed flow diagrams, see the `diagram.md` file in the project root.

## Project Structure

```
/
├── models/             # Mongoose models
├── routes/             # API routes
├── middleware/         # Middleware functions
├── public/             # Static files
├── frontend-vite/      # Vue 3 + Vite frontend
│   ├── src/            # Frontend source code
│   │   ├── components/ # Vue components
│   │   ├── views/      # Page views
│   │   ├── router/     # Vue Router configuration
│   │   ├── services/   # API services
│   │   └── assets/     # Static assets
│   ├── public/         # Public static assets
│   └── ...
├── Dockerfile          # Backend Dockerfile
├── frontend-vite/Dockerfile # Frontend Dockerfile
├── docker-compose.yml  # Docker Compose configuration
├── diagram.md          # Flow diagrams
└── server.js           # Main application file
```

## Development

The development server is configured to proxy API requests to the backend server running on port 3000. Make sure your backend server is running before starting the frontend development server.

The Vue 3 + Vite frontend uses the Composition API for better code organization and maintainability. Socket.IO is integrated for real-time updates to the leaderboard.

## Production

When you build the frontend project with `npm run build`, the output will be placed in the `dist` directory, which is served by Nginx in the Docker setup. The Docker configuration includes:

- Multi-stage build for the frontend to optimize image size
- Nginx configuration for serving the static files
- Node.js container for the backend API
- MongoDB container for data persistence

## Why Vue 3 + Vite?

Vue 3 with Vite offers several advantages over Vue 2 with Webpack:

1. **Composition API**: More flexible and maintainable code organization
2. **Faster development**: Vite provides instant server start and hot module replacement
3. **TypeScript support**: Better type checking and developer experience
4. **Smaller bundle size**: Vue 3 is more lightweight than Vue 2
5. **Better performance**: Improved reactivity system and rendering performance
6. **Simpler configuration**: Less boilerplate and configuration needed
7. **Future-proof**: Latest features and long-term support