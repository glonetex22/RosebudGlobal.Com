# Troubleshoot Server Connection

## Issue: ERR_CONNECTION_REFUSED

This means the server isn't running or isn't accessible.

## Check 1: Is the server running?

Look at the terminal where you ran `npm run dev`. You should see:
```
🚀 RoseBud Global API server running on port 3000
✅ Database connected
```

If you don't see this, the server may have crashed or stopped.

## Check 2: Start the server

If the server isn't running, start it:

```bash
cd ~/Downloads/RosebudGlobal.Com/backend
npm run dev
```

## Check 3: Verify port

The server should be on port 3000. Check:

```bash
lsof -i :3000
```

If nothing shows, the server isn't running.

## Check 4: Check for errors

Look at the server terminal for any error messages. Common issues:

- Database connection errors (should be fixed now)
- Port already in use
- Missing dependencies

## Check 5: Test with curl

In a new terminal:

```bash
curl http://localhost:3000/health
```

If this works, the server is running but browser might have issues.
If this fails, the server isn't running.

## Quick Fix: Restart Server

1. In the server terminal, press `Ctrl+C` to stop
2. Then restart:
   ```bash
   npm run dev
   ```

3. Wait for:
   ```
   ✅ Database connected
   ```

4. Then test:
   ```bash
   curl http://localhost:3000/health
   ```

## If Still Not Working

Check the server terminal for error messages and share them.
