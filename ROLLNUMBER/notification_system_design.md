# Notification System Design Documentation

## 1. API & Real-Time Design

The backend provides standard REST endpoints for notifications, and uses Socket.IO for live updates.

### API Formats
Every API response follows this basic wrapper:
```json
{
  "success": true,
  "message": "Status message",
  "data": { ... },
  "meta": { "page": 1, "limit": 10, "total": 50, "totalPages": 5 }
}
```

### Routes
- `GET /api/notifications`: Fetches paginated list of notifications.
- `GET /api/notifications/priority`: Gets the urgent alerts sorted by importance score.
- `POST /api/notifications`: Inserts a single notification.
- `POST /api/notifications/bulk`: Handles bulk alerts by deferring processing to the queue.
- `PATCH /api/notifications/:id/read`: Marks the alert as read.

### Real-Time (Socket.IO)
When the React frontend starts up, it opens a socket connection.
The server maps this connection to a room based on the student ID (`socket.join('student_XYZ')`).
When an alert is created, the backend pushes it directly to the room using `io.to('student_XYZ').emit(...)` so the client gets the alert instantly without refreshing.

---

## 2. Database & Indexing

### Schema
The Mongoose schema is simple and stores basic alert metadata:
```typescript
const NotificationSchema = new Schema({
  studentId: { type: String, required: true },
  type: { type: String, enum: ['Event', 'Result', 'Placement'], required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  priorityScore: { type: Number, default: 0 }
}, { timestamps: true });
```

### Compound Indexes
We added two compound indexes in MongoDB to speed up common search queries:
1. `{ studentId: 1, isRead: 1, createdAt: -1 }`: Used for fetching a student's unread notifications in reverse order.
2. `{ type: 1, createdAt: -1 }`: Used for admin panels to browse by categories.

---

## 3. Slow Queries & Performance

### Why queries get slow
Without indexes, MongoDB has to do a full table scan (COLLSCAN) to check every single document. With millions of alerts, this locks the database.

### The Tradeoff
While adding indexes speeds up reads significantly, every index slows down writes slightly because MongoDB has to update the index tree. Therefore, we only index fields used in `find` and `sort` filters.

---

## 4. Redis Caching Strategy

- **Read Caching:** When a user requests their feed, the server checks if the data is in Redis first. If it's there (Cache Hit), we serve it directly to save a DB trip.
- **Cache Eviction:** When a new notification is posted, we delete that user's cache key so their next request pulls fresh data from the DB.
- **Drawback:** Managing cache invalidation adds extra code complexity, and Redis uses expensive RAM storage.

---

## 5. Queue & Worker Systems

Sending thousands of alerts at once blocks the main JavaScript thread. To avoid this, we use an asynchronous queue:
1. The bulk API endpoint pushes the alerts array onto a queue.
2. The API immediately returns a `202 Accepted` to the caller.
3. A background worker reads the queue, inserts items in chunks, and triggers the socket broadcasts asynchronously.

This guarantees the API stays responsive even during heavy load.

---

## 6. Priority Inbox (O(N log K))

Instead of sorting all items in memory, we use a custom **MinHeap** to grab the top $K$ (e.g., 10) most important items.

### Importance Score Formula:
```
priorityScore = (TypeWeight * 10^10) + EpochTimestamp
```
- Placement Weight = 3
- Result Weight = 2
- Event Weight = 1

Multiplying the type weight ensures Placements always sit above Results and Events. Within the same category, newer alerts have a higher timestamp, so they show up first.

Using a MinHeap of size $K$ lets us process $N$ items in $O(N \log K)$ time, which is faster than doing a full sort which would take $O(N \log N)$.

---

## 7. Frontend Optimization

1. **Responsive CSS:** Uses basic Material UI Grid & Box component props that scale automatically from mobile screens to desktop monitors.
2. **Ghost Skeletons:** While the API is loading, skeleton cards are rendered so the page content doesn't jump around when the data loads.
3. **Optimistic Updates:** When the user clicks "Mark as Read", the frontend immediately updates the UI locally before waiting for the backend API response to finish.
