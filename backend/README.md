# RoseBud Global Backend API

Node.js/Express backend API for RoseBud Global e-commerce website with MySQL database.

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` file with your database credentials and other settings:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=rosebud_global
JWT_SECRET=your-random-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
PAYPAL_CLIENT_ID=your-paypal-client-id
PORT=3000
```

3. **Create database:**
```sql
CREATE DATABASE rosebud_global;
```

4. **Run database schema:**
```bash
mysql -u root -p rosebud_global < database/schema.sql
```

Or manually run the SQL file in your MySQL client.

## Running the Server

### Development (with auto-reload):
```bash
npm run dev
```

### Production:
```bash
npm start
```

The server will start on `http://localhost:3000` (or the PORT specified in .env).

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/paypal` - PayPal OAuth login
- `GET /api/auth/me` - Get current user (requires auth)

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/category/:category` - Get products by category

### Orders

- `POST /api/orders` - Create new order (requires auth)
- `GET /api/orders` - Get user's orders (requires auth)
- `GET /api/orders/:id` - Get order by ID (requires auth)
- `GET /api/orders/admin/all` - Get all orders (admin only)
- `PATCH /api/orders/:id/status` - Update order status (admin only)

### Inquiries

- `POST /api/inquiries` - Create new inquiry
- `GET /api/inquiries` - Get user's inquiries (requires auth)
- `GET /api/inquiries/:id` - Get inquiry by ID (requires auth)
- `GET /api/inquiries/admin/all` - Get all inquiries (admin only)
- `PATCH /api/inquiries/:id/status` - Update inquiry status (admin only)

## Authentication

Most endpoints require authentication via JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Database Schema

The database includes the following tables:

- **users** - User accounts (local and OAuth)
- **products** - Product catalog
- **orders** - Customer orders
- **order_items** - Order line items
- **inquiries** - Product inquiries
- **wishlist** - User wishlists (optional)

See `database/schema.sql` for full schema definition.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DB_HOST` | MySQL host | Yes |
| `DB_USER` | MySQL username | Yes |
| `DB_PASSWORD` | MySQL password | Yes |
| `DB_NAME` | Database name | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | Yes |
| `PAYPAL_CLIENT_ID` | PayPal Client ID | Yes |
| `PORT` | Server port | No (default: 3000) |
| `NODE_ENV` | Environment (development/production) | No |
| `CORS_ORIGINS` | Comma-separated CORS origins | No |

## Project Structure

```
backend/
├── config/
│   └── db.js              # Database configuration
├── middleware/
│   └── auth.js            # Authentication middleware
├── models/
│   ├── User.js            # User model
│   ├── Product.js         # Product model
│   ├── Order.js           # Order model
│   └── Inquiry.js         # Inquiry model
├── routes/
│   ├── auth.js            # Authentication routes
│   ├── products.js        # Product routes
│   ├── orders.js          # Order routes
│   └── inquiries.js       # Inquiry routes
├── database/
│   └── schema.sql         # Database schema
├── server.js              # Main server file
├── package.json           # Dependencies
├── .env.example           # Environment variables template
└── README.md              # This file
```

## Features

- ✅ User authentication (local, Google OAuth, PayPal OAuth)
- ✅ JWT token-based authentication
- ✅ Product catalog management
- ✅ Order management
- ✅ Inquiry system
- ✅ Location-based product filtering (USA/NG)
- ✅ Admin role support
- ✅ CORS enabled for frontend
- ✅ Error handling
- ✅ Database connection pooling

## Security Notes

- **JWT_SECRET**: Generate a strong random string for production
- **Database passwords**: Never commit `.env` file to git
- **HTTPS**: Use HTTPS in production
- **CORS**: Configure CORS_ORIGINS for production domains only

## Development

For development with auto-reload, install nodemon globally:
```bash
npm install -g nodemon
```

Then run:
```bash
npm run dev
```

## Hostinger Deployment

Since you're using Hostinger, you can deploy this backend:

1. Upload the `backend/` folder to your Hostinger account
2. Set up MySQL database via Hostinger control panel
3. Configure environment variables in Hostinger
4. Install Node.js dependencies: `npm install --production`
5. Run migrations: Import `database/schema.sql` via phpMyAdmin
6. Start the server (Hostinger may require PM2 or similar process manager)

## Testing

Test the API using tools like:
- Postman
- cURL
- Frontend integration

Example cURL request:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

## License

ISC
