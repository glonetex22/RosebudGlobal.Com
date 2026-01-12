# How to Unstick Your Terminal

## If Terminal is Stuck

### Method 1: Press Ctrl+C
Press `Ctrl+C` (or `Cmd+C` on Mac) to cancel the current command.

### Method 2: If that doesn't work
Press `Ctrl+Z` to suspend the process, then type `kill %1` to kill it.

### Method 3: If still stuck
- Close the terminal window
- Open a new terminal window
- Navigate back: `cd ~/Downloads/RosebudGlobal.Com/backend`

## If You're in MySQL Prompt

If you see `mysql>` prompt, type:
```
exit;
```
or
```
quit;
```

## After Unsticking

Once you're back to a normal prompt (`%` or `$`), run the setup commands again.
