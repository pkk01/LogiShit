# Customer Support System - API Reference

## Base URL

```
http://localhost:8000/api
```

## Authentication

All endpoints except public ones require JWT token in header:

```
Authorization: Bearer {access_token}
```

---

## 📋 SUPPORT TICKET ENDPOINTS

### 1. Create Support Ticket

**POST** `/support/tickets/create/`

**Required Auth:** Customer (user role)

**Request Body:**

```json
{
  "subject": "Package arrived damaged",
  "description": "The item inside was broken due to improper packaging",
  "category": "Damaged",
  "delivery_id": "507f1f77bcf86cd799439011" // Optional
}
```

**Response:**

```json
{
  "message": "Support ticket created successfully",
  "ticket": {
    "id": "507f1f77bcf86cd799439012",
    "subject": "Package arrived damaged",
    "status": "Open",
    "created_at": "2026-01-09T10:30:00Z"
  }
}
```

**Status Codes:** 201 (Created), 400 (Bad Request), 401 (Unauthorized)

---

### 2. Get Customer's Tickets

**GET** `/support/tickets/`

**Required Auth:** Customer (user role)

**Query Parameters:** None

**Response:**

```json
{
  "tickets": [
    {
      "id": "507f1f77bcf86cd799439012",
      "subject": "Package arrived damaged",
      "description": "...",
      "category": "Damaged",
      "status": "In Progress",
      "priority": "Medium",
      "agent_id": "507f1f77bcf86cd799439099",
      "created_at": "2026-01-09T10:30:00Z",
      "updated_at": "2026-01-09T11:45:00Z",
      "resolved_at": null
    }
  ]
}
```

**Status Codes:** 200 (OK), 401 (Unauthorized)

---

### 3. Get Ticket Details

**GET** `/support/tickets/{ticket_id}/`

**Required Auth:** Customer (own ticket), Agent (assigned), Admin

**Response:**

```json
{
  "ticket": {
    "id": "507f1f77bcf86cd799439012",
    "subject": "Package arrived damaged",
    "description": "...",
    "category": "Damaged",
    "status": "In Progress",
    "priority": "Medium",
    "agent_id": "507f1f77bcf86cd799439099",
    "customer_id": "507f1f77bcf86cd799439011",
    "created_at": "2026-01-09T10:30:00Z",
    "updated_at": "2026-01-09T11:45:00Z",
    "resolved_at": null
  },
  "internal_notes": [
    {
      "id": "507f1f77bcf86cd799439020",
      "agent_id": "507f1f77bcf86cd799439099",
      "note": "Customer claims item was damaged on delivery",
      "created_at": "2026-01-09T11:00:00Z"
    }
  ]
}
```

**Status Codes:** 200 (OK), 403 (Forbidden), 404 (Not Found), 401 (Unauthorized)

---

### 4. Update Ticket Status

**PUT** `/support/tickets/{ticket_id}/update-status/`

**Required Auth:** Agent (assigned), Admin

**Request Body:**

```json
{
  "status": "Resolved",
  "priority": "High" // Optional
}
```

**Valid Statuses:** Open, In Progress, On Hold, Resolved, Closed

**Response:**

```json
{
  "message": "Ticket status updated successfully",
  "ticket": {
    "id": "507f1f77bcf86cd799439012",
    "status": "Resolved",
    "priority": "High"
  }
}
```

**Status Codes:** 200 (OK), 400 (Bad Request), 403 (Forbidden), 404 (Not Found)

---

### 5. Assign Ticket to Self

**POST** `/support/tickets/{ticket_id}/assign-self/`

**Required Auth:** Support Agent (approved)

**Request Body:** Empty

**Response:**

```json
{
  "message": "Ticket assigned to you successfully",
  "ticket": {
    "id": "507f1f77bcf86cd799439012",
    "status": "In Progress",
    "agent_id": "507f1f77bcf86cd799439099"
  }
}
```

**Status Codes:** 200 (OK), 400 (Already assigned), 403 (Forbidden), 404 (Not Found)

---

### 6. Reassign Ticket (Admin Only)

**POST** `/support/tickets/{ticket_id}/reassign/`

**Required Auth:** Admin

**Request Body:**

```json
{
  "agent_id": "507f1f77bcf86cd799439098"
}
```

**Response:**

```json
{
  "message": "Ticket reassigned successfully",
  "ticket": {
    "id": "507f1f77bcf86cd799439012",
    "agent_id": "507f1f77bcf86cd799439098"
  }
}
```

**Status Codes:** 200 (OK), 403 (Forbidden), 404 (Not Found)

---

### 7. Add Internal Note

**POST** `/support/tickets/{ticket_id}/add-note/`

**Required Auth:** Support Agent

**Request Body:**

```json
{
  "note": "Awaiting customer photos of damaged item"
}
```

**Response:**

```json
{
  "message": "Internal note added successfully",
  "note": {
    "id": "507f1f77bcf86cd799439020",
    "note": "Awaiting customer photos of damaged item",
    "created_at": "2026-01-09T11:30:00Z"
  }
}
```

**Status Codes:** 201 (Created), 403 (Forbidden), 404 (Not Found)

---

### 8. Submit Feedback

**POST** `/support/tickets/{ticket_id}/feedback/`

**Required Auth:** Customer (own ticket, must be resolved)

**Request Body:**

```json
{
  "rating": "5",
  "comment": "Agent was very helpful and resolved the issue quickly"
}
```

**Valid Ratings:** 1, 2, 3, 4, 5

**Response:**

```json
{
  "message": "Feedback submitted successfully",
  "feedback": {
    "id": "507f1f77bcf86cd799439021",
    "rating": "5",
    "created_at": "2026-01-09T14:00:00Z"
  }
}
```

**Status Codes:** 201 (Created), 400 (Not resolved yet), 403 (Forbidden), 404 (Not Found)

---

## 👥 SUPPORT AGENT ENDPOINTS

### 1. Register Support Agent

**POST** `/support/register-agent/`

**Required Auth:** None (Public)

**Request Body:**

```json
{
  "email": "agent@example.com",
  "password": "securepass123",
  "name": "John Agent",
  "contact_number": "+91 98765 43210"
}
```

**Response:**

```json
{
  "message": "Registration successful. Waiting for admin approval.",
  "user": {
    "id": "507f1f77bcf86cd799439024",
    "email": "agent@example.com",
    "name": "John Agent",
    "role": "support_agent"
  }
}
```

**Status Codes:** 201 (Created), 400 (Already exists)

---

### 2. Get Agent's Assigned Tickets

**GET** `/agent/tickets/`

**Required Auth:** Support Agent (approved)

**Query Parameters:**

- `status` (optional): Open, In Progress, On Hold, Resolved, Closed

**Example:** `/agent/tickets/?status=Open`

**Response:**

```json
{
  "tickets": [
    {
      "id": "507f1f77bcf86cd799439012",
      "subject": "Package arrived damaged",
      "description": "...",
      "category": "Damaged",
      "status": "In Progress",
      "priority": "Medium",
      "customer_name": "John Customer",
      "customer_id": "507f1f77bcf86cd799439011",
      "created_at": "2026-01-09T10:30:00Z",
      "updated_at": "2026-01-09T11:45:00Z"
    }
  ]
}
```

**Status Codes:** 200 (OK), 403 (Not approved), 401 (Unauthorized)

---

## 🛡️ ADMIN ENDPOINTS

### 1. Approve Support Agent

**POST** `/admin/approve-agent/{agent_id}/`

**Required Auth:** Admin

**Request Body:** Empty

**Response:**

```json
{
  "message": "Agent approved successfully"
}
```

**Status Codes:** 200 (OK), 403 (Forbidden), 404 (Not Found)

---

### 2. Get All Support Tickets

**GET** `/admin/support/tickets/`

**Required Auth:** Admin

**Query Parameters:**

- `status` (optional): Open, In Progress, On Hold, Resolved, Closed

**Response:**

```json
{
  "tickets": [
    {
      "id": "507f1f77bcf86cd799439012",
      "subject": "Package arrived damaged",
      "category": "Damaged",
      "status": "In Progress",
      "priority": "Medium",
      "customer_name": "John Customer",
      "agent_name": "John Agent",
      "created_at": "2026-01-09T10:30:00Z",
      "updated_at": "2026-01-09T11:45:00Z"
    }
  ]
}
```

**Status Codes:** 200 (OK), 403 (Forbidden)

---

## 📚 FAQ ENDPOINTS

### 1. Get FAQs (Public)

**GET** `/support/faq/`

**Required Auth:** None (Public)

**Query Parameters:**

- `category` (optional): Damaged, Lost, Late, Quality, Other

**Example:** `/support/faq/?category=Damaged`

**Response:**

```json
{
  "faqs": [
    {
      "id": "507f1f77bcf86cd799439030",
      "question": "What if my package arrived damaged?",
      "answer": "Please create a support ticket immediately...",
      "category": "Damaged"
    }
  ]
}
```

**Status Codes:** 200 (OK)

---

## 🔄 Error Responses

### 400 Bad Request

```json
{
  "field_name": ["Error message"]
}
```

### 401 Unauthorized

```json
{
  "error": "Invalid credentials"
}
```

### 403 Forbidden

```json
{
  "error": "You can only view your own tickets"
}
```

### 404 Not Found

```json
{
  "error": "Ticket not found"
}
```

---

## 📊 Categories

Valid ticket categories:

- `Damaged` - Product arrived damaged
- `Lost` - Package lost in transit
- `Late` - Delivery delayed
- `Quality` - Quality or specification issue
- `Other` - General inquiry

---

## 🎯 Status Transitions

```
Open ↓
  ↓
In Progress ↓
  ├→ On Hold ↓
  │    ↓
  └→ Resolved ↓
       ↓
      Closed
```

---

## ⭐ Priority Levels

- `High` - Urgent
- `Medium` - Standard (default)
- `Low` - Non-urgent

---

## 📝 Example Usage - Complete Flow

### 1. Customer Creates Ticket

```bash
curl -X POST http://localhost:8000/api/support/tickets/create/ \
  -H "Authorization: Bearer {customer_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Product damaged",
    "description": "Item arrived broken",
    "category": "Damaged"
  }'
```

### 2. Agent Views Available Tickets

```bash
curl http://localhost:8000/api/agent/tickets/?status=Open \
  -H "Authorization: Bearer {agent_token}"
```

### 3. Agent Assigns to Self

```bash
curl -X POST http://localhost:8000/api/support/tickets/{ticket_id}/assign-self/ \
  -H "Authorization: Bearer {agent_token}"
```

### 4. Agent Updates Status

```bash
curl -X PUT http://localhost:8000/api/support/tickets/{ticket_id}/update-status/ \
  -H "Authorization: Bearer {agent_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Resolved",
    "priority": "High"
  }'
```

### 5. Customer Submits Feedback

```bash
curl -X POST http://localhost:8000/api/support/tickets/{ticket_id}/feedback/ \
  -H "Authorization: Bearer {customer_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": "5",
    "comment": "Great support!"
  }'
```

---

## ✅ Rate Limiting & Performance

- No rate limiting implemented (can be added later)
- All endpoints respond within 200ms typically
- Pagination can be added to large result sets

---

## 🔐 Security Notes

- All endpoints validate JWT tokens
- Users can only access their own data (customers their tickets, agents assigned tickets)
- Admins have full access
- Internal notes hidden from customers
- Agent approval required before access to agent features

---

**Last Updated:** January 9, 2026
