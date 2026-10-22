# SmartQueue REST API Documentation

This document describes all REST API endpoints available in the **SmartQueue** Spring Boot backend. 

All endpoints are hosted at base URL `http://localhost:8080/api` (or proxied from the frontend dev server at `http://localhost:5173/api`).

---

## Endpoint Verification Summary

| Category | Endpoint | Method | Status |
| :--- | :--- | :--- | :--- |
| **Authentication** | `/api/auth/register` | `POST` | Verified in Code (Needs Postman/CLI test) |
| | `/api/auth/login` | `POST` | ✅ **Tested & Verified** |
| | `/api/auth/me/{id}` | `GET` | Verified in Code (Needs Postman/CLI test) |
| **Queue & Ticketing** | `/api/queue/join` | `POST` | Verified in Code (Needs Postman/CLI test) |
| | `/api/queue/ticket/{ticketId}` | `GET` | ✅ **Tested & Verified** |
| | `/api/queue/user/{userId}` | `GET` | ✅ **Tested & Verified** |
| | `/api/queue/board` | `GET` | ✅ **Tested & Verified** |
| | `/api/queue/waiting` | `GET` | ✅ **Tested & Verified** |
| **Staff Terminal** | `/api/staff/next` | `POST` | Verified in Code (Needs Postman/CLI test) |
| | `/api/staff/complete/{ticketId}` | `POST` | Verified in Code (Needs Postman/CLI test) |
| | `/api/staff/skip/{ticketId}` | `POST` | Verified in Code (Needs Postman/CLI test) |
| | `/api/staff/recall/{ticketId}` | `POST` | Verified in Code (Needs Postman/CLI test) |
| | `/api/staff/test` | `GET` | ✅ **Tested & Verified** |
| **Counters** | `/api/counters` | `GET` | ✅ **Tested & Verified** |
| | `/api/counters/service/{serviceId}` | `GET` | ✅ **Tested & Verified** |
| | `/api/counters` | `POST` | Verified in Code (Needs Postman/CLI test) |
| | `/api/counters/{id}/status` | `PUT` | Verified in Code (Needs Postman/CLI test) |
| **Services Catalog**| `/api/services` | `GET` | ✅ **Tested & Verified** |
| | `/api/services` | `POST` | Verified in Code (Needs Postman/CLI test) |
| **Admin & Analytics**| `/api/admin/stats` | `GET` | ✅ **Tested & Verified** |
| | `/api/admin/test` | `GET` | ✅ **Tested & Verified** |
| **AI Copilot** | `/api/ai/chat` | `POST` | ✅ **Tested & Verified** |
| | `/api/ai/health` | `GET` | ✅ **Tested & Verified** |

---

## 1. Authentication Endpoints (`/api/auth`)

> **Note on Current Implementation:** Passwords are currently checked in plain text for development, and the token returned is formatted as `mock-token-{id}`. Real JWT and BCrypt hashing are scheduled for the next release.

### 1.1 Login User
- **Method:** `POST`
- **URL:** `/api/auth/login`
- **Verification Status:** ✅ Tested & Verified
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "email": "test@example.com",
  "password": "test123"
}
```
- **Success Response (200 OK):**
```json
{
  "id": 1,
  "name": "Test User",
  "email": "test@example.com",
  "role": "USER",
  "token": "mock-token-1"
}
```
- **Error Response (Current Behavior):** If credentials do not match an existing record, the service throws `RuntimeException("Invalid email or password")`, which currently results in a `500 Internal Server Error`. (Adding a custom `@ControllerAdvice` to return `401 Unauthorized` is recommended).

### 1.2 Register User
- **Method:** `POST`
- **URL:** `/api/auth/register`
- **Verification Status:** Verified in Code
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "name": "John Doe",
  "email": "johndoe@example.com",
  "password": "securepass123",
  "role": "CUSTOMER"
}
```
- **Success Response (200 OK):**
```json
{
  "id": 7,
  "name": "John Doe",
  "email": "johndoe@example.com",
  "role": "CUSTOMER",
  "token": "mock-token-7"
}
```

### 1.3 Get User Profile by ID
- **Method:** `GET`
- **URL:** `/api/auth/me/{id}`
- **Verification Status:** Verified in Code
- **Path Variable:** `id` (Long, e.g. `1`)
- **Success Response (200 OK):**
```json
{
  "id": 1,
  "name": "Test User",
  "email": "test@example.com",
  "password": "test123",
  "role": "USER"
}
```

---

## 2. Queue & Ticketing Endpoints (`/api/queue`)

### 2.1 Join Queue (Issue Token)
- **Method:** `POST`
- **URL:** `/api/queue/join`
- **Verification Status:** Verified in Code
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "serviceId": 1,
  "userName": "Purnika Sharma",
  "userEmail": "purnika@example.com",
  "priority": "NORMAL"
}
```
*(Priority can be `"NORMAL"`, `"HIGH"`, or `"URGENT"`)*
- **Success Response (200 OK):**
```json
{
  "id": 9,
  "tokenNumber": "B003",
  "user": {
    "id": 3,
    "name": "Purnika Sharma",
    "email": "purnika@example.com",
    "role": "CUSTOMER"
  },
  "service": {
    "id": 1,
    "name": "Bonafide Certificate",
    "averageServiceTime": 10,
    "active": true
  },
  "counter": null,
  "status": "WAITING",
  "priority": "NORMAL",
  "createdAt": "2026-10-22T14:40:00.123456",
  "calledAt": null,
  "completedAt": null
}
```

### 2.2 Get Ticket Live Status
- **Method:** `GET`
- **URL:** `/api/queue/ticket/{ticketId}`
- **Verification Status:** ✅ Tested & Verified
- **Path Variable:** `ticketId` (e.g. `1`)
- **Success Response (200 OK):**
```json
{
  "ticket": {
    "id": 1,
    "tokenNumber": "B001",
    "status": "WAITING",
    "priority": "NORMAL",
    "service": {
      "id": 1,
      "name": "Bonafide Certificate",
      "averageServiceTime": 10,
      "active": true
    }
  },
  "positionAhead": 0,
  "estimatedWaitMinutes": 10,
  "serviceName": "Bonafide Certificate",
  "counterName": null,
  "status": "WAITING"
}
```

### 2.3 Get User's Tickets
- **Method:** `GET`
- **URL:** `/api/queue/user/{userId}`
- **Verification Status:** ✅ Tested & Verified
- **Path Variable:** `userId` (e.g. `1`)
- **Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "tokenNumber": "B001",
    "status": "WAITING",
    "priority": "NORMAL",
    "service": {
      "id": 1,
      "name": "Bonafide Certificate"
    }
  }
]
```

### 2.4 Get Live Public Display Board Data
- **Method:** `GET`
- **URL:** `/api/queue/board`
- **Verification Status:** ✅ Tested & Verified
- **Purpose:** Supplies data for public TV monitors and waiting hall displays.
- **Success Response (200 OK):**
```json
{
  "nowServing": [
    {
      "counterId": 1,
      "counterName": "Counter 1",
      "tokenNumber": "B001",
      "serviceName": "Bonafide Certificate",
      "calledAt": "14:35:12"
    }
  ],
  "waitingTickets": [
    {
      "id": 3,
      "tokenNumber": "B002",
      "status": "WAITING",
      "priority": "URGENT"
    }
  ],
  "totalWaiting": 6,
  "totalServedToday": 2,
  "activeCountersCount": 5
}
```

### 2.5 Get Waiting Tickets
- **Method:** `GET`
- **URL:** `/api/queue/waiting` (Optional query parameter: `?serviceId=1`)
- **Verification Status:** ✅ Tested & Verified
- **Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "tokenNumber": "B001",
    "status": "WAITING",
    "priority": "NORMAL"
  },
  {
    "id": 3,
    "tokenNumber": "B002",
    "status": "WAITING",
    "priority": "URGENT"
  }
]
```

---

## 3. Staff Counter Operations (`/api/staff`)

### 3.1 Call Next Ticket
- **Method:** `POST`
- **URL:** `/api/staff/next?serviceId={serviceId}&counterId={counterId}`
- **Verification Status:** Verified in Code
- **Query Parameters:**
  - `serviceId`: ID of the service assigned to this counter (e.g. `1`)
  - `counterId`: ID of the counter calling the ticket (e.g. `1`)
- **Success Response (200 OK):** Returns the ticket updated to status `"CALLED"`, timestamps `calledAt`, and counter updated to status `"BUSY"`.

### 3.2 Complete Ticket
- **Method:** `POST`
- **URL:** `/api/staff/complete/{ticketId}`
- **Verification Status:** Verified in Code
- **Path Variable:** `ticketId`
- **Success Response (200 OK):** Returns the ticket with status `"COMPLETED"`, sets `completedAt = NOW()`, and resets the assigned counter back to `"AVAILABLE"`.

### 3.3 Skip Ticket
- **Method:** `POST`
- **URL:** `/api/staff/skip/{ticketId}`
- **Verification Status:** Verified in Code
- **Path Variable:** `ticketId`
- **Success Response (200 OK):** Returns the ticket with status `"SKIPPED"` and frees the assigned counter back to `"AVAILABLE"`.

### 3.4 Recall Ticket
- **Method:** `POST`
- **URL:** `/api/staff/recall/{ticketId}`
- **Verification Status:** Verified in Code
- **Path Variable:** `ticketId`
- **Success Response (200 OK):** Updates `calledAt` timestamp so public display boards and voice announcers broadcast the token again.

### 3.5 Staff Diagnostic Health Check
- **Method:** `GET`
- **URL:** `/api/staff/test`
- **Verification Status:** ✅ Tested & Verified
- **Success Response (200 OK):** `"Staff API is working"`

---

## 4. Counter Management Endpoints (`/api/counters`)

### 4.1 List All Counters
- **Method:** `GET`
- **URL:** `/api/counters`
- **Verification Status:** ✅ Tested & Verified
- **Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Counter 1",
    "service": {
      "id": 1,
      "name": "Bonafide Certificate",
      "averageServiceTime": 10,
      "active": true
    },
    "staffId": 1,
    "status": "AVAILABLE"
  }
]
```

### 4.2 List Counters by Service
- **Method:** `GET`
- **URL:** `/api/counters/service/{serviceId}`
- **Verification Status:** ✅ Tested & Verified
- **Path Variable:** `serviceId` (e.g. `1`)
- **Success Response (200 OK):** Returns list of counters mapped to the specified service ID.

### 4.3 Create Counter
- **Method:** `POST`
- **URL:** `/api/counters`
- **Verification Status:** Verified in Code
- **Request Body:**
```json
{
  "name": "Counter 05 - Express Verification",
  "serviceId": 1,
  "staffId": 2,
  "status": "AVAILABLE"
}
```
- **Success Response (200 OK):** Returns newly persisted `Counter` entity.

### 4.4 Update Counter Operational Status
- **Method:** `PUT`
- **URL:** `/api/counters/{id}/status?status={status}`
- **Verification Status:** Verified in Code
- **Path Variable:** `id` (Counter ID)
- **Query Parameter:** `status` (`AVAILABLE`, `BUSY`, or `OFFLINE`)
- **Success Response (200 OK):** Returns updated `Counter` entity.

---

## 5. Service Catalog Endpoints (`/api/services`)

### 5.1 List All Services
- **Method:** `GET`
- **URL:** `/api/services`
- **Verification Status:** ✅ Tested & Verified
- **Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Bonafide Certificate",
    "description": "Issue bonafide certificates to students",
    "averageServiceTime": 10,
    "active": true
  },
  {
    "id": 3,
    "name": "ID Card Issue/Renewal",
    "description": "Student and staff identity cards",
    "averageServiceTime": 8,
    "active": true
  }
]
```

### 5.2 Create Service
- **Method:** `POST`
- **URL:** `/api/services`
- **Verification Status:** Verified in Code
- **Request Body:**
```json
{
  "name": "Library Clearance",
  "description": "Book returns, fine settlements, and clearance stamps",
  "averageServiceTime": 3,
  "active": true
}
```
- **Success Response (200 OK):** Returns newly saved `QueueService` entity with generated `id`.

---

## 6. Admin & Analytics Endpoints (`/api/admin`)

### 6.1 Get Global Queue Statistics
- **Method:** `GET`
- **URL:** `/api/admin/stats`
- **Verification Status:** ✅ Tested & Verified
- **Success Response (200 OK):**
```json
{
  "totalTickets": 8,
  "waitingCount": 6,
  "calledCount": 0,
  "completedCount": 2,
  "skippedCount": 0,
  "activeCounters": 5,
  "avgWaitTimeMinutes": 7.5,
  "serviceQueueCounts": {
    "Bonafide Certificate": 3,
    "ID Card Issue/Renewal": 1,
    "Fee Payment": 1,
    "Admissions & Counseling": 1
  }
}
```

### 6.2 Admin Diagnostic Health Check
- **Method:** `GET`
- **URL:** `/api/admin/test`
- **Verification Status:** ✅ Tested & Verified
- **Success Response (200 OK):** `"Admin API is working"`

---

## 7. AI Copilot Endpoints (`/api/ai`)

### 7.1 Chat with AI Copilot
- **Method:** `POST`
- **URL:** `/api/ai/chat`
- **Verification Status:** ✅ Tested & Verified
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "message": "What documents do I need for Bonafide certificate?",
  "apiKey": ""
}
```
- **Success Response (200 OK):**
```json
{
  "reply": "### 📄 Bonafide Certificate Guidelines\n\nTo obtain a Bonafide Certificate from the administrative counter, please prepare:\n- **Student Identity Card** (or enrollment number)\n- **Tuition Fee Clearance Receipt** for the current term\n- **Formal Purpose Slip** (e.g. for Education Loan, Passport, Bus Pass, or Scholarship)\n\n📍 **Processing Desk:** Counter 01 (Academic & Certificates)\n⏱️ **Average Service Time:** ~5 minutes\n👥 **Current Waiting in Line:** 2 student(s)\n\nYou can generate a digital token now to join this queue directly!\n",
  "recommendedServiceId": 1,
  "recommendedServiceName": "Bonafide Certificate",
  "action": "JOIN_QUEUE",
  "source": "SMART_KNOWLEDGE_BASE",
  "estimatedWaitMinutes": 5
}
```

### 7.2 AI Service Health Check
- **Method:** `GET`
- **URL:** `/api/ai/health`
- **Verification Status:** ✅ Tested & Verified
- **Success Response (200 OK):** `"SmartQueue AI Copilot is operational"`
