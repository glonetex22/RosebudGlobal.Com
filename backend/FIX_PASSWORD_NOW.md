# Fix Database Password - Quick Steps

## The Issue
MySQL requires a password, but `.env` has `DB_PASSWORD=` (empty).

## Quick Fix

### Step 1: Find Your MySQL Password
- Did you set a password during MySQL installation? Use that.
- If you don't remember, you'll need to reset it (see below).

### Step 2: Update .env File

```bash
nano .env
```

Find this line:
```
DB_PASSWORD=
```

Change it to:
```
DB_PASSWORD=your_mysql_password_here
```

Save: `Ctrl+X`, then `Y`, then `Enter`

### Step 3: Server Will Auto-Reload
The server (nodemon) will automatically detect the change and restart.

You should see:
```
✅ Database connected
```

## If You Don't Know the Password

### Option A: Reset MySQL Root Password

1. **Stop MySQL:**
   ```bash
   sudo /usr/local/mysql/support-files/mysql.server stop
   ```

2. **Start in safe mode:**
   ```bash
   sudo /usr/local/mysql/bin/mysqld_safe --skip-grant-tables &
   ```

3. **Connect:**
   ```bash
   mysql -u root
   ```

4. **In MySQL, run:**
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword123';
   FLUSH PRIVILEGES;
   exit;
   ```

5. **Restart MySQL:**
   ```bash
   sudo /usr/local/mysql/support-files/mysql.server restart
   ```

6. **Update .env:**
   ```
   DB_PASSWORD=newpassword123
   ```

### Option B: Create New MySQL User (Easier)

1. **Connect as root (you'll need to know root password or reset it):**
   ```bash
   mysql -u root -p
   ```

2. **In MySQL, create new user:**
   ```sql
   CREATE USER 'rosebud'@'localhost' IDENTIFIED BY 'rosebud123';
   GRANT ALL PRIVILEGES ON rosebud_global.* TO 'rosebud'@'localhost';
   FLUSH PRIVILEGES;
   exit;
   ```

3. **Update .env:**
   ```
   DB_USER=rosebud
   DB_PASSWORD=rosebud123
   ```

## After Fixing Password

The server should automatically reconnect. Check your terminal - you should see:
```
✅ Database connected
```

If not, the server will auto-reload when you save the .env file.
