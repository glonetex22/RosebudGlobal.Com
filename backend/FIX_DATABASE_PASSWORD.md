# Fix Database Password Issue

## Problem
The error shows: `Access denied for user 'root'@'localhost' (using password: NO)`

This means MySQL requires a password, but your `.env` file has an empty password.

## Solution Options

### Option 1: Set MySQL Password in .env (Recommended)

1. **Find out your MySQL password:**
   - If you set one during installation, use that
   - If you don't remember, you may need to reset it

2. **Edit .env file:**
   ```bash
   nano .env
   ```
   
3. **Change this line:**
   ```
   DB_PASSWORD=
   ```
   
   **To:**
   ```
   DB_PASSWORD=your_mysql_password_here
   ```
   
4. **Save:** Press `Ctrl+X`, then `Y`, then `Enter`

5. **Restart server:** The server should auto-reload with nodemon

### Option 2: Reset MySQL Root Password

If you don't know the password, reset it:

```bash
# Stop MySQL (if running as service)
sudo /usr/local/mysql/support-files/mysql.server stop

# Start MySQL in safe mode
sudo /usr/local/mysql/bin/mysqld_safe --skip-grant-tables &

# Connect without password
mysql -u root

# In MySQL, run:
ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';
FLUSH PRIVILEGES;
exit;

# Restart MySQL normally
sudo /usr/local/mysql/support-files/mysql.server restart
```

Then update `.env` with the new password.

### Option 3: Create MySQL User Without Password (Less Secure)

```bash
mysql -u root -p
```

Then in MySQL:
```sql
CREATE USER 'rosebud'@'localhost' IDENTIFIED BY '';
GRANT ALL PRIVILEGES ON rosebud_global.* TO 'rosebud'@'localhost';
FLUSH PRIVILEGES;
exit;
```

Then update `.env`:
```
DB_USER=rosebud
DB_PASSWORD=
```

## Quick Fix

The fastest solution is to:

1. **Test if MySQL needs password:**
   ```bash
   mysql -u root -e "SELECT 1;"
   ```
   
   - If it works → MySQL doesn't need password, keep `DB_PASSWORD=` empty
   - If it asks for password → You need to set `DB_PASSWORD=` in `.env`

2. **If it needs password, edit .env:**
   ```bash
   nano .env
   # Change: DB_PASSWORD=your_password
   ```

3. **Server will auto-reload** (nodemon watches for changes)
