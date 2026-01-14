# RoseBud Global Admin Dashboard

React-based admin dashboard for managing RoseBud Global e-commerce platform.

## Setup

1. Install dependencies:
```bash
cd admin
npm install
```

2. Create `.env` file (optional):
```env
VITE_API_URL=http://localhost:3000/api
```

3. Start development server:
```bash
npm run dev
```

The admin dashboard will be available at `http://localhost:3001`

## Build for Production

```bash
npm run build
```

## Project Structure

```
admin/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/          # Page components
│   ├── context/        # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API services
│   ├── utils/          # Utility functions
│   └── styles/         # CSS styles
├── public/             # Static assets
└── package.json        # Dependencies
```

## Features

- ✅ Authentication (Login/Logout)
- ✅ Dashboard with statistics
- ✅ Product management
- ✅ Order management
- ✅ Inquiry management
- ✅ Category management
- ✅ Customer management
- ✅ Settings

## Default Login

- Email: `admin@rosebudglobal.com`
- Password: `Admin@123456`

## Tech Stack

- React 18
- React Router 6
- Vite
- Tailwind CSS
- Axios
- Recharts
- Lucide React
- React Hot Toast
