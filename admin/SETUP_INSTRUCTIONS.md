# RoseBud Global Admin Dashboard - Setup Instructions

## Prerequisites

- Node.js 18+ installed
- Backend API running on `http://localhost:3000`

## Installation Steps

1. **Navigate to admin directory:**
   ```bash
   cd admin
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file (optional):**
   ```bash
   echo "VITE_API_URL=http://localhost:3000/api" > .env
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Access the dashboard:**
   Open `http://localhost:3001` in your browser

## Default Login Credentials

- **Email:** `admin@rosebudglobal.com`
- **Password:** `Admin@123456`

## Project Structure

```
admin/
├── src/
│   ├── components/
│   │   ├── Common/          # Reusable UI components
│   │   ├── Layout/          # Layout components (Sidebar, Header)
│   │   └── Charts/          # Chart components
│   ├── pages/               # Page components
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Products/
│   │   ├── Orders/
│   │   ├── Inquiries/
│   │   ├── Categories/
│   │   ├── Customers/
│   │   └── Settings/
│   ├── context/             # React Context providers
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API service layer
│   ├── utils/               # Utility functions
│   └── styles/              # CSS styles
├── public/                  # Static assets
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Features Implemented

✅ Authentication system
✅ Protected routes
✅ Dashboard with statistics
✅ Layout with sidebar navigation
✅ Common UI components
✅ API service with interceptors
✅ Form validation utilities
✅ Date/currency formatters

## Features To Be Implemented

- Product CRUD operations
- Order management
- Inquiry management
- Category management
- Customer management
- Settings page
- File upload functionality
- Advanced filtering and search

## Troubleshooting

**Port 3001 already in use:**
- Change port in `vite.config.js` or kill the process using port 3001

**API connection errors:**
- Ensure backend is running on `http://localhost:3000`
- Check CORS settings in backend
- Verify API endpoints in `src/services/api.js`

**Build errors:**
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
