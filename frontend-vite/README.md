# Score Tracking Frontend (Vue 3 + Vite)

This is the frontend application for the Score Tracking API, built with Vue 3 and Vite.

## Features

- Modern Vue 3 application with Composition API
- Fast development with Vite
- Real-time leaderboard updates with Socket.IO
- User authentication with JWT
- Responsive design

## Project Structure

```
frontend-vite/
├── public/             # Static assets
├── src/                # Source code
│   ├── assets/         # CSS and other assets
│   ├── components/     # Vue components
│   ├── router/         # Vue Router configuration
│   ├── views/          # Page components
│   ├── App.vue         # Root component
│   └── main.js         # Application entry point
├── index.html          # HTML template
├── vite.config.js      # Vite configuration
├── package.json        # Project dependencies
└── README.md           # Project documentation
```

## Development

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
# or
yarn install
```

### Running the Development Server

```bash
# Start the development server
npm run dev
# or
yarn dev
```

The application will be available at http://localhost:5173/

### Building for Production

```bash
# Build the application
npm run build
# or
yarn build
```

The built files will be in the `dist` directory.

## Docker

This application can be run in Docker using the provided Dockerfile and docker-compose.yml.

```bash
# Build and run with docker-compose
docker-compose up
```

The application will be available at http://localhost:8080/

## API Integration

The frontend communicates with the backend API through:

- RESTful API endpoints for authentication and score updates
- Socket.IO for real-time leaderboard updates

## License

MIT 