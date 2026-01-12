# Start the Server

## The server is not currently running

You need to start it in a terminal window.

## Step 1: Open a Terminal

Open a new terminal window (or use the one where you edited .env).

## Step 2: Navigate to Backend Folder

```bash
cd ~/Downloads/RosebudGlobal.Com/backend
```

## Step 3: Start the Server

```bash
npm run dev
```

## Step 4: Wait for Success Message

You should see:
```
🚀 RoseBud Global API server running on port 3000
📡 Environment: development
🌐 CORS origins: http://localhost:8000, https://rosebudglobal.com, https://www.rosebudglobal.com
✅ Database connected
```

## Step 5: Test in Browser

Once you see "✅ Database connected", open your browser and go to:

**http://localhost:3000/health**

You should see a JSON response like:
```json
{
  "success": true,
  "message": "RoseBud Global API is running",
  "timestamp": "..."
}
```

## Keep the Terminal Open

**Important:** Keep the terminal window with `npm run dev` running. If you close it, the server stops.

## If You See Errors

Share the error message and we'll fix it.

## Quick Start Command

```bash
cd ~/Downloads/RosebudGlobal.Com/backend && npm run dev
```
