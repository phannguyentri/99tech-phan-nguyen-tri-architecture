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
       │  and scoreChange value       │                              │                              │
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
       │  with success status,        │                              │                              │
       │  newScore and leaderboard    │                              │                              │
       │ <─────────────────────────────                              │                              │
       │                              │                              │                              │
       │  9. Update local user        │                              │                              │
       │  score and leaderboard       │                              │                              │
       │                              │                              │                              │
       │                              │  10. Broadcast updated       │                              │
       │                              │  leaderboard via Socket.IO   │                              │
       │                              │  with 'leaderboard' event    │                              │
       │                              │ ─────────────────────────────────────────────────────────────>
       │                              │                              │                              │
       │                              │                              │                              │  11. Update UI
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
│  Client 1   │                │  Socket.IO  │                │  Client 2   │
│  (Browser)  │                │   Server    │                │  (Browser)  │
└──────┬──────┘                └──────┬──────┘                └──────┬──────┘
       │                              │                              │
       │  1. Connect to Socket.IO     │                              │
       │ ─────────────────────────────>                              │
       │                              │                              │
       │                              │                              │  2. Connect to Socket.IO
       │                              │ <─────────────────────────────
       │                              │                              │
       │  3. Listen for               │                              │
       │  'leaderboard' events        │                              │
       │ ─────────────────────────────>                              │
       │                              │                              │
       │                              │                              │  4. Listen for
       │                              │                              │  'leaderboard' events
       │                              │ <─────────────────────────────
       │                              │                              │
       │  5. Score update by          │                              │
       │  Client 1 via REST API       │                              │
       │ ─────────────────────────────>                              │
       │                              │                              │
       │  6. Confirmation with        │                              │
       │  updated score and           │                              │
       │  leaderboard                 │                              │
       │ <─────────────────────────────                              │
       │                              │                              │
       │  7. Update local UI          │                              │
       │  with new data               │                              │
       │                              │                              │
       │                              │  8. Broadcast updated        │
       │                              │  leaderboard to all clients  │
       │                              │  with 'leaderboard' event    │
       │                              │                              │
       │  9. Receive update           │                              │
       │ <─────────────────────────────                              │
       │                              │                              │
       │                              │                              │  10. Receive update
       │                              │ ─────────────────────────────>
       │                              │                              │
       │  11. Update UI if needed     │                              │
       │  (already updated from       │                              │
       │  direct API response)        │                              │
       │                              │                              │  12. Update UI
       │                              │                              │  with new data
       │                              │                              │
┌──────┴──────┐                ┌──────┴──────┐                ┌──────┴──────┐
│  Client 1   │                │  Socket.IO  │                │  Client 2   │
│  (Browser)  │                │   Server    │                │  (Browser)  │
└─────────────┘                └─────────────┘                └─────────────┘
``` 