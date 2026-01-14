# Order Management API Documentation

## Base URL
`/api/admin/orders`

All routes require authentication via Bearer token.

## Endpoints

### 1. GET /api/admin/orders
Get all orders with pagination and filters.

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 20) - Items per page
- `search` - Search in order number, customer email, name
- `status` - Filter by order status
- `paymentStatus` - Filter by payment status
- `startDate` - Filter orders from date (YYYY-MM-DD)
- `endDate` - Filter orders to date (YYYY-MM-DD)
- `sort` (default: created_at) - Sort column
- `order` (default: DESC) - Sort order (ASC, DESC)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 2. GET /api/admin/orders/:id
Get single order with all details including items and customer info.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "order_number": "RBG-000001",
    "items": [...],
    "customer": {...}
  }
}
```

### 3. PUT /api/admin/orders/:id/status
Update order status.

**Body:**
```json
{
  "status": "shipped",
  "notifyCustomer": true
}
```

**Valid Statuses:** pending, confirmed, processing, shipped, delivered, cancelled, refunded

**Response:**
```json
{
  "success": true,
  "message": "Order status updated"
}
```

### 4. PUT /api/admin/orders/:id/tracking
Update tracking information.

**Body:**
```json
{
  "trackingNumber": "1Z999AA10123456784",
  "trackingUrl": "https://tracking.example.com/1Z999AA10123456784",
  "shippingMethod": "UPS Ground",
  "notifyCustomer": true
}
```

### 5. PUT /api/admin/orders/:id/notes
Update admin notes.

**Body:**
```json
{
  "adminNotes": "Customer requested expedited shipping"
}
```

### 6. POST /api/admin/orders/:id/refund
Process refund (super_admin, admin only).

**Body:**
```json
{
  "amount": 99.99,
  "reason": "Customer requested refund",
  "refundType": "full"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Refund processed"
}
```

### 7. GET /api/admin/orders/stats/summary
Get order statistics.

**Query Parameters:**
- `period` (default: 30) - Number of days

**Response:**
```json
{
  "success": true,
  "data": {
    "totals": {
      "total_orders": 150,
      "total_revenue": 45000.00,
      "avg_order_value": 300.00
    },
    "byStatus": [...],
    "byPayment": [...],
    "daily": [...]
  }
}
```

## Order Statuses

- `pending` - Order placed, awaiting confirmation
- `confirmed` - Order confirmed
- `processing` - Order being prepared
- `shipped` - Order shipped
- `delivered` - Order delivered
- `cancelled` - Order cancelled
- `refunded` - Order refunded

## Payment Statuses

- `pending` - Payment pending
- `paid` - Payment completed
- `failed` - Payment failed
- `refunded` - Fully refunded
- `partially_refunded` - Partially refunded

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error message"
}
```

**Status Codes:**
- 400 - Bad Request
- 401 - Unauthorized
- 403 - Forbidden (insufficient permissions)
- 404 - Not Found
- 500 - Internal Server Error
