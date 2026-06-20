# REST API Reference

Complete reference for the REST API controller generated with `--with-api`.

---

## Overview

When you generate a module with `--with-api`, a full CRUD REST API is produced in:

```
odoo_module/controllers/{snake_name}_controller.py
```

The controller class `{Pascal}RestController(http.Controller)` registers all routes on Odoo's
built-in HTTP server. No additional framework or dependency is needed.

---

## Authentication

All endpoints require Odoo **session authentication** (`auth='user'`).

Make a `POST /web/session/authenticate` call first:

```bash
curl -s -c cookies.txt -X POST http://localhost:8069/web/session/authenticate \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
      "db": "odoo",
      "login": "admin",
      "password": "admin"
    }
  }'
```

Then pass the session cookie on subsequent requests:

```bash
curl -s -b cookies.txt http://localhost:8069/api/fleet-manager
```

---

## Base URL

```
http://{your-odoo-host}:{port}/api/{endpoint}
```

The `endpoint` slug is the **kebab-case** module name:

| Module name | Endpoint prefix |
|-------------|----------------|
| `fleet_manager` | `/api/fleet-manager` |
| `hospital_records` | `/api/hospital-records` |
| `my_crm` | `/api/my-crm` |

---

## Response Format

All endpoints return **standardised JSON**:

### Success

```json
{
  "status": "success",
  "data": { ... },
  "meta": { ... }
}
```

### Error

```json
{
  "status": "error",
  "message": "Human-readable error description",
  "code": "error_code"
}
```

`meta` is only present on list responses. `code` is only present on error responses.

---

## Endpoints

### `GET /api/{endpoint}` — List records

Returns a paginated, filterable list of records.

**Query parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | `80` | Max records (capped at 500) |
| `offset` | integer | `0` | Pagination offset |
| `state` | string | — | Filter by state: `draft`, `confirmed`, `in_progress`, `done`, `cancelled` |
| `search` | string | — | Search by name (case-insensitive `ilike`) |
| `order` | string | `"name asc"` | Sort expression (e.g. `"date_start desc"`) |

**Default domain:** `[('active', '=', True)]` — archived records are excluded.

**Fields returned:**

```json
["id", "name", "reference", "state", "user_id", "date_start", "date_end", "priority"]
```

**Example request:**

```bash
curl -b cookies.txt \
  "http://localhost:8069/api/fleet-manager?limit=20&offset=0&state=draft&search=truck"
```

**Example response:**

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Truck Maintenance Q1",
      "reference": "FLE/2026/00001",
      "state": "draft",
      "user_id": [3, "Administrator"],
      "date_start": "2026-01-01",
      "date_end": "2026-03-31",
      "priority": "0"
    }
  ],
  "meta": {
    "total": 1,
    "limit": 20,
    "offset": 0,
    "returned": 1
  }
}
```

---

### `GET /api/{endpoint}/<id>` — Get single record

Returns all fields of a single record by integer ID.

**Path parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Record ID |

**Query parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `fields` | string | all default fields | Comma-separated field names to return |

**Default fields returned:**

```json
["id", "name", "reference", "state", "description", "user_id", "company_id",
 "date_start", "date_end", "priority", "active", "create_date", "write_date"]
```

**Example request:**

```bash
curl -b cookies.txt "http://localhost:8069/api/fleet-manager/1"
curl -b cookies.txt "http://localhost:8069/api/fleet-manager/1?fields=id,name,state,reference"
```

**Example response:**

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "Truck Maintenance Q1",
    "reference": "FLE/2026/00001",
    "state": "draft",
    "description": "Quarterly truck fleet inspection and oil change.",
    "user_id": [3, "Administrator"],
    "company_id": [1, "My Company"],
    "date_start": "2026-01-01",
    "date_end": "2026-03-31",
    "priority": "0",
    "active": true,
    "create_date": "2026-06-20 10:00:00",
    "write_date": "2026-06-20 10:00:00"
  }
}
```

**Error — Not Found (404):**

```json
{
  "status": "error",
  "message": "Record 999 not found"
}
```

**Error — Invalid ID (400):**

```json
{
  "status": "error",
  "message": "Invalid ID format"
}
```

---

### `POST /api/{endpoint}` — Create record

Creates a new record.

**Content-Type:** `application/json`

**Request body (JSON):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | **yes** | Record name |
| `description` | string | no | Free-text description |
| `date_start` | string | no | Date in `YYYY-MM-DD` format |
| `date_end` | string | no | Date in `YYYY-MM-DD` format |
| `priority` | string | no | `"0"` \| `"1"` \| `"2"` \| `"3"` |
| `user_id` | integer | no | User ID |
| `tag_ids` | array | no | Odoo Many2many commands |

**Example request:**

```bash
curl -b cookies.txt -X POST http://localhost:8069/api/fleet-manager \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
      "name": "New Fleet Record",
      "description": "Test record from API",
      "date_start": "2026-07-01",
      "date_end": "2026-12-31",
      "priority": "1"
    }
  }'
```

**Example response (201):**

```json
{
  "status": "success",
  "data": {
    "id": 42,
    "reference": "FLE/2026/00042",
    "name": "New Fleet Record"
  }
}
```

**Error — Missing name (400):**

```json
{
  "status": "error",
  "message": "'name' field is required"
}
```

**Error — Validation (400):**

```json
{
  "status": "error",
  "message": "Start date must be before end date.",
  "code": "validation_error"
}
```

---

### `PUT /api/{endpoint}/<id>` — Update record

Updates an existing record.

**Content-Type:** `application/json`

**Protected fields** (silently stripped from the request body):

```
id, reference, create_date, write_date
```

**Example request:**

```bash
curl -b cookies.txt -X PUT http://localhost:8069/api/fleet-manager/42 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
      "description": "Updated description",
      "priority": "2"
    }
  }'
```

**Example response:**

```json
{
  "status": "success",
  "data": {
    "id": 42,
    "updated": true
  }
}
```

---

### `DELETE /api/{endpoint}/<id>` — Delete record

Deletes a record. Only records in `draft` or `cancelled` state can be deleted.

**State guard:** Attempting to delete a `confirmed`, `in_progress`, or `done` record returns HTTP 409.

**Example request:**

```bash
curl -b cookies.txt -X DELETE http://localhost:8069/api/fleet-manager/42
```

**Example response:**

```json
{
  "status": "success",
  "data": {
    "deleted": true,
    "id": 42
  }
}
```

**Error — Wrong state (409):**

```json
{
  "status": "error",
  "message": "Cannot delete record in state \"confirmed\". Cancel it first."
}
```

---

### `POST /api/{endpoint}/<id>/action` — Call business action

Triggers a state machine action on a record.

**Content-Type:** `application/json`

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | string | **yes** | Action name (see table below) |

**Allowed actions:**

| Action value | Method called | Description |
|-------------|--------------|-------------|
| `"confirm"` | `action_confirm()` | Draft → Confirmed |
| `"start"` | `action_start()` | Confirmed → In Progress |
| `"done"` | `action_done()` | In Progress → Done |
| `"cancel"` | `action_cancel()` | Any → Cancelled |
| `"reset_draft"` | `action_reset_draft()` | Cancelled → Draft |

**Example request:**

```bash
curl -b cookies.txt -X POST http://localhost:8069/api/fleet-manager/42/action \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
      "action": "confirm"
    }
  }'
```

**Example response:**

```json
{
  "status": "success",
  "data": {
    "id": 42,
    "state": "confirmed"
  }
}
```

**Error — Unknown action (400):**

```json
{
  "status": "error",
  "message": "Unknown action \"approve\". Allowed: ['confirm', 'start', 'done', 'cancel', 'reset_draft']"
}
```

**Error — Business logic violation (400, code: user_error):**

```json
{
  "status": "error",
  "message": "Only draft records can be confirmed.",
  "code": "user_error"
}
```

---

### `GET /api/{endpoint}/stats` — Aggregate statistics

Returns a count of records in each state.

**Example request:**

```bash
curl -b cookies.txt "http://localhost:8069/api/fleet-manager/stats"
```

**Example response:**

```json
{
  "status": "success",
  "data": {
    "draft": 5,
    "confirmed": 3,
    "in_progress": 2,
    "done": 10,
    "cancelled": 1,
    "total": 21
  }
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `400` | Bad request (validation error, bad ID, unknown action) |
| `403` | Access denied (Odoo `AccessError`) |
| `404` | Record not found |
| `409` | Conflict (cannot delete in current state) |
| `500` | Internal server error |

---

## CORS

All endpoints are generated with `cors='*'` — any origin may call them. Restrict this in
production by overriding the route or adding an Nginx/proxy-level CORS policy.

---

## Error Codes

| Code | When emitted |
|------|-------------|
| `validation_error` | `odoo.exceptions.ValidationError` |
| `access_denied` | `odoo.exceptions.AccessError` |
| `user_error` | `odoo.exceptions.UserError` |

---

## Postman Collection

Import this collection into Postman for quick testing:

```json
{
  "info": { "name": "Fleet Manager API", "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json" },
  "item": [
    {
      "name": "List Records",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/api/fleet-manager?limit=20&state=draft"
      }
    },
    {
      "name": "Get Record",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/api/fleet-manager/1"
      }
    },
    {
      "name": "Create Record",
      "request": {
        "method": "POST",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "url": "{{base_url}}/api/fleet-manager",
        "body": {
          "mode": "raw",
          "raw": "{\"jsonrpc\":\"2.0\",\"method\":\"call\",\"params\":{\"name\":\"Test\"}}"
        }
      }
    },
    {
      "name": "Confirm Record",
      "request": {
        "method": "POST",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "url": "{{base_url}}/api/fleet-manager/1/action",
        "body": {
          "mode": "raw",
          "raw": "{\"jsonrpc\":\"2.0\",\"method\":\"call\",\"params\":{\"action\":\"confirm\"}}"
        }
      }
    },
    {
      "name": "Stats",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/api/fleet-manager/stats"
      }
    }
  ],
  "variable": [
    { "key": "base_url", "value": "http://localhost:8069" }
  ]
}
```

---

## Extending the Controller

To add a custom endpoint, open `controllers/{snake_name}_controller.py` and add a new route
method to the existing `{Pascal}RestController` class:

```python
@http.route(
    '/api/fleet-manager/export',
    auth='user',
    methods=['GET'],
    csrf=False,
    cors='*',
)
def export_csv(self, **kwargs):
    """Export all records as CSV."""
    import csv, io
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['ID', 'Name', 'Reference', 'State'])
    records = request.env['fleet.manager'].search_read(
        domain=[],
        fields=['id', 'name', 'reference', 'state'],
    )
    for r in records:
        writer.writerow([r['id'], r['name'], r['reference'], r['state']])
    return Response(
        output.getvalue(),
        status=200,
        headers={
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="fleet_manager.csv"',
        },
    )
```
