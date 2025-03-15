# Score Tracking System - Execution Flow Diagram

```
┌─────────────┐                ┌─────────────┐                ┌─────────────┐                ┌─────────────┐
│   Frontend  │                │  API Server │                │  Database   │                │ Connected   │
│  Application│                │  (Node.js)  │                │  (MongoDB)  │                │   Clients   │
└──────┬──────┘                └──────┬──────┘                └──────┬──────┘                └──────┬──────┘
       │                              │                              │                              │
       │                              │                              │                              │
       │  1. User performs action     │                              │                              │
       │  that increases score        │                              │                              │
       │                              │                              │                              │
       │  2. Send score update        │                              │                              │
       │  request with JWT token      │                              │                              │
       │ ─────────────────────────────>                              │                              │
       │                              │                              │                              │
       │                              │  3. Validate JWT token       │                              │
       │                              │  and user authorization      │                              │
       │                              │                              │                              │
       │                              │  4. Validate score           │                              │
       │                              │  update request              │                              │
       │                              │                              │                              │
       │                              │  5. Update user score        │                              │
       │                              │ ─────────────────────────────>                              │
       │                              │                              │                              │
       │                              │                              │  6. Perform update           │
       │                              │                              │  and return success          │
       │                              │  7. Fetch updated           │                              │
       │                              │  leaderboard                 │                              │
       │                              │ <─────────────────────────────                              │
       │                              │                              │                              │
       │  8. Return API response      │                              │                              │
       │  with success status         │                              │                              │
       │ <─────────────────────────────                              │                              │
       │                              │                              │                              │
       │                              │  9. Broadcast updated        │                              │
       │                              │  leaderboard via WebSocket   │                              │
       │                              │ ─────────────────────────────────────────────────────────────>
       │                              │                              │                              │
       │                              │                              │                              │  10. Update UI
       │                              │                              │                              │  with new data
       │                              │                              │                              │
       │                              │                              │                              │
┌──────┴──────┐                ┌──────┴──────┐                ┌──────┴──────┐                ┌──────┴──────┐
│   Frontend  │                │  API Server │                │  Database   │                │ Connected   │
│  Application│                │  (Node.js)  │                │  (MongoDB)  │                │   Clients   │
└─────────────┘                └─────────────┘                └─────────────┘                └─────────────┘
```

## Security Flow Diagram

```
┌─────────────┐                ┌─────────────┐                ┌─────────────┐
│    User     │                │  API Server │                │  Database   │
│  Frontend   │                │  (Node.js)  │                │  (MongoDB)  │
└──────┬──────┘                └──────┬──────┘                └──────┬──────┘
       │                              │                              │
       │  1. Login Request            │                              │
       │  (username/password)         │                              │
       │ ─────────────────────────────>                              │
       │                              │                              │
       │                              │  2. Verify credentials       │
       │                              │ ─────────────────────────────>
       │                              │                              │
       │                              │  3. Return user data         │
       │                              │ <─────────────────────────────
       │                              │                              │
       │                              │  4. Generate JWT token       │
       │                              │  with user claims            │
       │                              │                              │
       │  5. Return JWT token         │                              │
       │ <─────────────────────────────                              │
       │                              │                              │
       │  6. Store token in           │                              │
       │  localStorage/cookies        │                              │
       │                              │                              │
       │  7. Score Update Request     │                              │
       │  with JWT in Authorization   │                              │
       │  header                      │                              │
       │ ─────────────────────────────>                              │
       │                              │                              │
       │                              │  8. Verify JWT signature     │
       │                              │  and expiration              │
       │                              │                              │
       │                              │  9. Extract user ID          │
       │                              │  from token                  │
       │                              │                              │
       │                              │  10. Check authorization     │
       │                              │  for the operation           │
       │                              │                              │
       │                              │  11. Update score if         │
       │                              │  authorized                  │
       │                              │ ─────────────────────────────>
       │                              │                              │
┌──────┴──────┐                ┌──────┴──────┐                ┌──────┴──────┐
│    User     │                │  API Server │                │  Database   │
│  Frontend   │                │  (Node.js)  │                │  (MongoDB)  │
└─────────────┘                └─────────────┘                └─────────────┘
```

## Real-time Updates Flow

```
┌─────────────┐                ┌─────────────┐                ┌─────────────┐
│  Client 1   │                │  WebSocket  │                │  Client 2   │
│  (Browser)  │                │   Server    │                │  (Browser)  │
└──────┬──────┘                └──────┬──────┘                └──────┬──────┘
       │                              │                              │
       │  1. Connect to WebSocket     │                              │
       │ ─────────────────────────────>                              │
       │                              │                              │
       │                              │                              │  2. Connect to WebSocket
       │                              │ <─────────────────────────────
       │                              │                              │
       │  3. Subscribe to             │                              │
       │  leaderboard updates         │                              │
       │ ─────────────────────────────>                              │
       │                              │                              │
       │                              │                              │  4. Subscribe to
       │                              │                              │  leaderboard updates
       │                              │ <─────────────────────────────
       │                              │                              │
       │  5. Score update by          │                              │
       │  Client 1                    │                              │
       │ ─────────────────────────────>                              │
       │                              │                              │
       │  6. Confirmation             │                              │
       │ <─────────────────────────────                              │
       │                              │                              │
       │                              │  7. Broadcast updated        │
       │                              │  leaderboard to all clients  │
       │                              │                              │
       │  8. Receive update           │                              │
       │ <─────────────────────────────                              │
       │                              │                              │
       │                              │                              │  9. Receive update
       │                              │ ─────────────────────────────>
       │                              │                              │
       │  10. Update UI               │                              │
       │  with new data               │                              │
       │                              │                              │  11. Update UI
       │                              │                              │  with new data
       │                              │                              │
┌──────┴──────┐                ┌──────┴──────┐                ┌──────┴──────┐
│  Client 1   │                │  WebSocket  │                │  Client 2   │
│  (Browser)  │                │   Server    │                │  (Browser)  │
└─────────────┘                └─────────────┘                └─────────────┘
``` 