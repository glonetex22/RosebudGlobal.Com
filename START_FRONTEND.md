# Start the Frontend Website

## Backend is Running ✅

Your API is working at: `http://localhost:3000`

## Start Frontend Server

### Step 1: Open a NEW Terminal Window

Keep the backend terminal running, and open a **new terminal window**.

### Step 2: Navigate to Project Root

```bash
cd ~/Downloads/RosebudGlobal.Com
```

### Step 3: Start Frontend Server

```bash
python3 -m http.server 8000
```

### Step 4: Open in Browser

Visit: **http://localhost:8000**

You should see the RoseBud Global website!

## What You'll Have Running

- **Backend API**: `http://localhost:3000` (in one terminal)
- **Frontend Website**: `http://localhost:8000` (in another terminal)

## Quick Start (New Terminal)

```bash
cd ~/Downloads/RosebudGlobal.Com && python3 -m http.server 8000
```

Then visit: **http://localhost:8000**

## Test the Full Site

1. ✅ Backend API: http://localhost:3000/health
2. ✅ Frontend: http://localhost:8000
3. ✅ Shop page: http://localhost:8000/shop.html
4. ✅ Product page: http://localhost:8000/product.html
5. ✅ Sign in: http://localhost:8000/signin.html

## Note

The frontend currently uses localStorage for data. To connect it to the backend API, you'll need to update the frontend JavaScript files to make API calls instead of using localStorage.

But for now, you can test all the frontend features with localStorage!
