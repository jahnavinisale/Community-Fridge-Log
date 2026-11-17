# Community Fridge Log - Complete REST API Specification

All endpoints are served under `/api` and exchange standard JSON.

---

## 1. Authentication and Security
- Protected routes require a JSON Web Token passed in the `Authorization` header:
  `Authorization: Bearer <token>`
- Login endpoint is protected by rate limiting (`express-rate-limit`) to prevent brute-force attacks.
- All HTTP responses include standard security headers via `helmet`.
- Centralized error handler formats all errors consistently:
  ```json
  {
    "success": false,
    "error": {
      "message": "Human readable description",
      "code": "ERROR_CODE",
      "status": 400,
      "details": []
    }
  }
  ```

---

## 2. Authentication Endpoints

### `POST /api/auth/login`
Authenticates an authorized volunteer or administrator.

**Request Body:**
```json
{
  "email": "sarah.volunteer@communityfridge.org",
  "password": "Volunteer123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "6738b5...",
      "name": "Sarah Jenkins (Volunteer)",
      "email": "sarah.volunteer@communityfridge.org",
      "role": "volunteer",
      "phone": "+44 7700 900456",
      "isActive": true
    }
  }
}
```

**Error (401 Unauthorized):**
```json
{
  "success": false,
  "error": {
    "message": "Invalid email or password credentials",
    "code": "INVALID_CREDENTIALS",
    "status": 401
  }
}
```

---

### `GET /api/auth/me`
Retrieves authenticated user profile. Requires valid bearer token.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "6738b5...",
      "name": "Sarah Jenkins (Volunteer)",
      "email": "sarah.volunteer@communityfridge.org",
      "role": "volunteer",
      "phone": "+44 7700 900456",
      "isActive": true
    }
  }
}
```

---

## 3. Inventory and Food Items Endpoints

### `GET /api/items`
Returns filtered and sorted food items.

**Query Parameters:**
- `status` (string, optional): `in_stock` (default), `collected`, `disposed`, `all`
- `category` (string, optional): `dairy`, `produce`, `bakery`, `cooked meal`, `packaged`, `drinks`, `other`
- `storageLocation` (string, optional): `fridge`, `freezer`, `pantry`
- `useByStatus` (string, optional): `expired`, `use_today`, `soon`, `ok`
- `expiringWithinDays` (integer, optional): filter items expiring within N days
- `search` (string, optional): free-text search on name, donor, or notes
- `sortBy` (string, optional): field name (default `useByDate`)
- `order` (string, optional): `asc` (default) or `desc`
- `page` (integer, optional): page number (default 1)
- `limit` (integer, optional): results per page (default 50)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "6738c1...",
        "name": "[SAMPLE] Fresh Semi-Skimmed Milk 2L",
        "category": "dairy",
        "quantity": 5,
        "unit": "items",
        "useByDate": "2026-11-17T18:00:00.000Z",
        "donatedBy": "Co-op Supermarket",
        "storageLocation": "fridge",
        "status": "in_stock",
        "useByStatus": "use_today",
        "daysRemaining": 0
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 50,
      "totalPages": 1
    }
  }
}
```

---

### `GET /api/items/:id`
Retrieves a single item record and its complete lifecycle audit trail.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "item": {
      "_id": "6738c1...",
      "name": "[SAMPLE] Fresh Semi-Skimmed Milk 2L",
      "category": "dairy",
      "quantity": 5,
      "unit": "items",
      "useByDate": "2026-11-17T18:00:00.000Z",
      "useByStatus": "use_today",
      "daysRemaining": 0
    },
    "logs": [
      {
        "_id": "6738c2...",
        "type": "intake",
        "quantity": 5,
        "unit": "items",
        "performedByName": "Sarah Jenkins",
        "createdAt": "2026-11-15T10:00:00.000Z"
      }
    ]
  }
}
```

---

### `POST /api/items`
Records a new food donation into the fridge log. Automatically creates a corresponding `intake` log entry.

**Request Body:**
```json
{
  "name": "Artisan Sourdough Loaves",
  "category": "bakery",
  "quantity": 4,
  "unit": "loaves",
  "useByDate": "2026-11-19",
  "dateReceived": "2026-11-17",
  "donatedBy": "Crust & Crumb Bakery",
  "storageLocation": "pantry",
  "storageNote": "Ambient bread rack shelf 1",
  "allergensNote": "Contains wheat (gluten)",
  "notes": "Fresh batch from morning delivery"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Item added to inventory successfully",
  "data": {
    "_id": "6738d4...",
    "name": "Artisan Sourdough Loaves",
    "quantity": 4,
    "status": "in_stock"
  }
}
```

---

### `PATCH /api/items/:id` and `PUT /api/items/:id`
Updates fields of an existing item record.

**Request Body (Partial):**
```json
{
  "quantity": 3,
  "storageNote": "Moved to bottom shelf"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Item updated successfully",
  "data": { ... }
}
```

---

### `DELETE /api/items/:id`
Deletes an item record from the inventory.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Item 'Artisan Sourdough Loaves' deleted successfully"
}
```

---

### `POST /api/items/:id/collect`
Logs a food collection or pickup.
- Enforces quantity limits: cannot collect more than current available stock (`INSUFFICIENT_QUANTITY` 400).
- Deducts requested quantity.
- When remaining quantity reaches 0, automatically transitions status to `collected`.
- Creates a `collection` log entry.

**Request Body:**
```json
{
  "quantity": 2,
  "reason": "community_pickup",
  "note": "Collected for elderly resident hamper"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully collected 2 loaves of Artisan Sourdough Loaves",
  "data": {
    "item": {
      "quantity": 2,
      "status": "in_stock"
    },
    "log": {
      "type": "collection",
      "quantity": 2,
      "reason": "community_pickup"
    }
  }
}
```

---

### `POST /api/items/:id/dispose`
Logs a food disposal with mandatory safety reason.
- Enforces quantity limits: cannot dispose more than current available stock (`INSUFFICIENT_QUANTITY` 400).
- Mandatory disposal reason must be one of: `expired`, `spoiled`, `damaged_packaging`, `contamination_suspected`, `recalled`, `other`.
- When reason is `other`, a detailed note (minimum 3 characters) is strictly required.
- Deducts requested quantity.
- When remaining quantity reaches 0, automatically transitions status to `disposed`.
- Creates a `disposal` log entry.

**Request Body:**
```json
{
  "quantity": 1,
  "reason": "damaged_packaging",
  "note": "Seal broken during transport"
}
```

**Error Response (400 Bad Request) if reason is missing or invalid:**
```json
{
  "success": false,
  "error": {
    "message": "Input validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "reason",
        "message": "Disposal reason must be one of: expired, spoiled, damaged_packaging, contamination_suspected, recalled, other"
      }
    ],
    "status": 400
  }
}
```

---

## 4. Stats and Analytics Endpoints

### `GET /api/stats/summary`
Returns simplified urgency status counts for high-level indicators.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "expired": 2,
    "useToday": 3,
    "within2Days": 3,
    "soon": 3,
    "ok": 5,
    "inStock": 13,
    "total": 13
  }
}
```

---

### `GET /api/logs/stats`
Returns full dashboard analytics, including urgency breakdown, urgent items list, activity log totals, category distribution, and disposal reasons breakdown.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "urgencySummary": {
      "expired": 2,
      "useToday": 3,
      "useWithin2Days": 3,
      "soon": 3,
      "ok": 5,
      "totalInStock": 13,
      "needsAttentionTotal": 8
    },
    "logTotals": {
      "intakes": 10,
      "collections": 2,
      "disposals": 5
    },
    "disposalReasonsBreakdown": [
      { "reason": "expired", "count": 2, "totalQuantity": 5 },
      { "reason": "spoiled", "count": 1, "totalQuantity": 2 },
      { "reason": "damaged_packaging", "count": 1, "totalQuantity": 1 }
    ],
    "categoryBreakdown": [
      { "category": "produce", "count": 4, "totalQuantity": 18 },
      { "category": "dairy", "count": 3, "totalQuantity": 12 }
    ],
    "urgentItems": [ ... ],
    "recentActivity": [ ... ]
  }
}
```

---

### `GET /api/logs`
Returns audited log entries across intakes, collections, and disposals.

**Query Parameters:**
- `type` (optional): `collection`, `disposal`, `intake`
- `reason` (optional): disposal or collection reason
- `from` / `fromDate` (optional): ISO date string
- `to` / `toDate` (optional): ISO date string
- `search` (optional): search on item name, note, or volunteer
- `page` (optional): page number (default 1)
- `limit` (optional): results per page (default 30)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "_id": "6738e1...",
        "type": "disposal",
        "itemName": "[SAMPLE] Pre-packed Caesar Salad Bowls",
        "quantity": 3,
        "unit": "packs",
        "reason": "expired",
        "note": "Past use-by date by 2 days",
        "performedByName": "Sarah Jenkins",
        "createdAt": "2026-11-17T11:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 30,
      "totalPages": 1
    }
  }
}
```

---

## 5. Fridge Configuration Endpoints

### `GET /api/fridges`
Retrieves metadata of the default community fridge (location, capacity, temperature).

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "name": "Main Community Fridge",
    "location": "Community Center Courtyard, 104 High Street",
    "capacityLitres": 450,
    "temperatureCelsius": 3.2,
    "isDefault": true
  }
}
```

---

## 6. Volunteer & User Management (Admin Only)

### `GET /api/users`
Returns roster of all registered volunteers and administrators. Restricted to administrators (`requireRole('admin')`).

### `POST /api/users`
Admin provisions a new volunteer account. Public signup is disabled.

**Request Body:**
```json
{
  "name": "David Miller",
  "email": "david.volunteer@communityfridge.org",
  "password": "SecurePassword123!",
  "role": "volunteer",
  "phone": "+44 7700 900555"
}
```

### `PATCH /api/users/:id`
Admin updates volunteer role or toggles activation state (`isActive: false` / `isActive: true`). Prevents admin from self-deactivating.

---

## 7. Health Check

### `GET /api/health`
Unauthenticated health probe.

**Response (200 OK):**
```json
{
  "status": "ok",
  "service": "Community Fridge Log API",
  "uptime": 128.4,
  "timestamp": "2026-11-17T12:00:00.000Z"
}
```
