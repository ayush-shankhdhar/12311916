# Campus Notification System (Hiring Evaluation Package)

A production-grade, highly-scalable campus notification platform delivering real-time alerts, priority algorithmic tiering, and decoupled event-driven pipelines.

---

## 📦 Repository Components

```text
ROLLNUMBER/
├── logging-middleware/          # Isolated Node module with batching, retry & external audit hooks
├── notification_app_be/         # Node/Express API backed by Mongoose, Socket.IO & mock workers
├── notification_app_fe/         # Next.js 15 App Router built with strict Material-UI design
├── notification_system_design.md# Architectural documentation (Stage 1 - 7)
└── README.md                    # This system handbook
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js v20+
- MongoDB Community Server (v6.0+)
- NPM v10+

### 1. Build Logging Shared Package
```bash
cd logging-middleware
npm install
npm run build
```

### 2. Initialize Express Backend API
```bash
cd ../notification_app_be
npm install
# Copy example env and configure variables
cp .env.example .env
npm run dev
```
*Backend spins up on `http://localhost:4000`.*

### 3. Initialize Next.js Frontend
```bash
cd ../notification_app_fe
npm install --legacy-peer-deps
npm run dev
```
*Frontend boots exclusively on `http://localhost:3000`.*

---

## 📈 Architectural Highlights

### Core Logging Protocol
Built as a first-class custom middleware library. Absolutely zero `console.log` usages are present. Logs contain unified payloads mapping **STACK**, **LEVEL**, and **PACKAGE** dimensions before buffering and delivering via Axios with full exponential backoff retries to the designated evaluative auditing hub.

### The O(N log K) Priority Smart-Inbox
The Priority Inbox invokes our custom `MinHeap` Utility. When clients request their primary priority notifications, rather than performing expensive Database-level global sorts, the service collects target rows and sifts them through the Heap in linearithmic time. 

### Real-Time Delivery Design
WebSocket channels bind incoming queries mapping student keys directly to virtual rooms.
Immediate notifications bypass HTTP round-trips, streaming directly through Socket.io into active browsers, triggering React Snackbar alerts instantly.

---

## 🖼️ Screenshots & Media Hub

### Desktop Preview
<!-- [DESKTOP PREVIEW PLACEHOLDER] -->
*Provides optimized viewport layout showing global sidebar overlay and wide notifications cards grid.*

### Mobile Layout Preview
<!-- [MOBILE PREVIEW PLACEHOLDER] -->
*Collapsible swipe-out MUI Drawers and stacked chips preserving legible Typography scales on compact screens.*

### Postman Execution Flow
<!-- [POSTMAN PREVIEW PLACEHOLDER] -->
*Standard HTTP status verification (201 Created, 202 Accepted for Queue offloads) mapping API contracts.*

### External Service Logging Stream
<!-- [LOGGING PREVIEW PLACEHOLDER] -->
*Axios-buffered logs tracking Request Ingress, DB Connect lifecycles, priority weights, and batch status logs.*

### Video Demo Sandbox
<!-- [DEMO LINK PLACEHOLDER] -->
*Interactive recording walkthrough capturing Live sockets instantly flashing alerts upon database insertions.*
