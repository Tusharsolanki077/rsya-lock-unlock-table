# Table Reservation Lock API Demo

A simple Node.js/Express API for managing table reservations with **temporary locks**, featuring a minimal frontend for easy manual testing.

## Features

- **In-memory lock management** (no DB required, resets on server restart).
- **REST API** with endpoints to lock, unlock, and check status of a table.
- **Frontend UI** at `/` for interactively testing all endpoints.
- **Single or multi-user simulation** (just enter IDs).
- **Prevents double-booking** by applying exclusive, temporary locks.

---

## Folder Structure

table-lock-demo/
├── app.js        # Express backend: API logic + static file server
└── public/
└── index.html   # Standalone frontend UI
└── style.css

## Directly test with 

backend url - 


## Setup

### 1. Prerequisites

- Node.js (v14+ recommended)
- npm (comes with Node.js)

### 2. Installation & Run

Clone/download this project,

```bash
cd table-lock-demo

Install dependencies
Bash

npm install express body-parser

Start the server
Bash

node app.js

3. Access UI

Open in your browser:

http://localhost:3000/

You’ll see the testing web UI.

API Documentation

1. Lock a Table

POST /api/tables/lock

Request JSON:
JSON

{
  "tableId": "table-123",
  "userId": "user-abc",
  "duration": 600
}

    tableId (string): Unique table identifier.

    userId (string): User reserving the table.

    duration (number, seconds): Lock period.

Responses:

    200 OK
    { "success": true, "message": "Table locked successfully." }

    409 Conflict
    { "success": false, "message": "Table is currently locked by another user." }

    400 Bad Request
    { "success": false, "message": "Invalid request..." }

2. Unlock a Table

POST /api/tables/unlock

Request JSON:
JSON

{
  "tableId": "table-123",
  "userId": "user-abc"
}

    Only the lock owner can unlock.

Responses:

    200 OK
    { "success": true, "message": "Table unlocked successfully." }

    400 Bad Request

        If table not locked or expired:
        { "success": false, "message": "Unlock failed: Table not locked or lock expired." }

        If wrong user:
        { "success": false, "message": "Unlock failed: Table not locked by this user." }

3. Check Table Lock Status

GET /api/tables/:tableId/status

Response:

    200 OK
    { "isLocked": true }
    or
    { "isLocked": false }

Frontend UI: Quick Guide

Open / in your browser to use the forms:

    Lock a Table:
    Enter Table ID, User ID, Duration and click "Lock Table".

    Unlock a Table:
    Enter Table ID and User ID (must match lock creator), click "Unlock Table".

    Check Status:
    Enter Table ID and click "Check Status" to see if it's currently locked.

The UI shows API responses ("success", errors, lock state) in real-time.

How It Works

    Table locks are stored in-memory (tableLocks object), not in a database.

    Each lock includes: userId (who locked) and expiry (timestamp when lock ends).

    Locking a table creates a lock if not present or expired; otherwise, it fails.

    Unlocking requires that userId matches the lock's creator.

    Expired locks are auto-removed ("garbage collected") at every relevant API request.

    All HTTP responses follow REST conventions using appropriate status codes.

Limitations & Notes

    Stateless: All data is lost when the server restarts (good for demo).

    No authentication: Users are simulated by any string as userId.

    No “list all tables” endpoint: Only lock, unlock, and status.



Example Usage (with curl)

Lock
Bash

curl -X POST http://localhost:3000/api/tables/lock \
-H "Content-Type: application/json" \
-d '{"tableId":"T1","userId":"alice","duration":30}'

Status
Bash

curl http://localhost:3000/api/tables/T1/status

Unlock
Bash

curl -X POST http://localhost:3000/api/tables/unlock \
-H "Content-Type: application/json" \
-d '{"tableId":"T1","userId":"alice"}'

Customization

    Add authentication or integrate with a database for persistence.

    Extend API for listing all locks, showing expiry timestamps, or for admin override.

    Style or expand frontend as needed (or connect to your real reservation UI).
