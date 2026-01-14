# Product Management API Documentation

## Base URL
`/api/admin/products`

All routes require authentication via Bearer token.

## Endpoints

### 1. GET /api/admin/products
Get all products with pagination and filters.

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 20) - Items per page
- `search` - Search in name, SKU, description
- `category` - Filter by category ID
- `status` - Filter by status (active, draft, out_of_stock, discontinued)
- `sort` (default: created_at) - Sort column (created_at, name, price, stock_quantity, status)
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

### 2. GET /api/admin/products/:id
Get single product with all details including images.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "sku": "RBG-P001",
    "name": "Product Name",
    "images": [...]
  }
}
```

### 3. POST /api/admin/products
Create new product.

**Required Fields:**
- `sku` - Product SKU (unique)
- `name` - Product name
- `price` - Product price (float, min: 0)

**Optional Fields:**
- `description`, `shortDescription`
- `salePrice`, `costPrice`
- `categoryId`, `brand`, `material`, `dimensions`, `weight`, `color`
- `stockQuantity`, `lowStockThreshold`
- `status` (default: draft)
- `isFeatured`, `isNew`, `isSale` (boolean)
- `actionType` (add_to_cart, make_inquiry)
- `metaTitle`, `metaDescription`, `tags`
- `images` - Array of {url, alt}

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 1,
    "sku": "RBG-P001",
    "name": "Product Name"
  }
}
```

### 4. PUT /api/admin/products/:id
Update existing product.

**Fields:** Same as POST (all optional except validation)

**Response:**
```json
{
  "success": true,
  "message": "Product updated successfully"
}
```

### 5. DELETE /api/admin/products/:id
Delete product (super_admin, admin only).

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

### 6. PUT /api/admin/products/:id/status
Quick status update.

**Body:**
```json
{
  "status": "active"
}
```

**Valid Statuses:** active, draft, out_of_stock, discontinued

### 7. PUT /api/admin/products/:id/stock
Quick stock update.

**Body:**
```json
{
  "stockQuantity": 100
}
```

### 8. POST /api/admin/products/bulk-action
Bulk actions on products (super_admin, admin only).

**Body:**
```json
{
  "action": "activate",
  "productIds": [1, 2, 3]
}
```

**Actions:** activate, deactivate, delete

**Response:**
```json
{
  "success": true,
  "message": "Bulk activate completed",
  "affected": 3
}
```

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error message"
}
```

**Status Codes:**
- 400 - Bad Request (validation errors)
- 401 - Unauthorized (missing/invalid token)
- 403 - Forbidden (insufficient permissions)
- 404 - Not Found
- 500 - Internal Server Error
