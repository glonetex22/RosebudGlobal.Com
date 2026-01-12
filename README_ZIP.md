# 📦 RoseBud Global Backend - ZIP Package

## What's Included

This ZIP file contains the complete Node.js/Express backend for RoseBud Global e-commerce website.

### Contents:
- ✅ Complete backend code (Express.js, MySQL)
- ✅ Database schema (SQL file)
- ✅ All API routes (Auth, Products, Orders, Inquiries)
- ✅ Models and middleware
- ✅ Configuration files
- ✅ Setup scripts
- ✅ Comprehensive documentation

### Excluded (to keep file size small):
- ❌ `node_modules/` (install with `npm install`)
- ❌ `.env` file (copy from `.env.example`)

## Quick Start After Extraction

1. **Extract** the ZIP file
2. **Open terminal** in the extracted `backend/` folder
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Set up database:**
   - Install MySQL (see `MYSQL_SETUP_ALTERNATIVES.md`)
   - Create database: `mysql -u root -p -e "CREATE DATABASE rosebud_global;"`
   - Import schema: `mysql -u root -p rosebud_global < database/schema.sql`
5. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your MySQL password
   ```
6. **Start server:**
   ```bash
   npm run dev
   ```

## Documentation Files

- `EXTRACT_AND_RUN.md` - Quick start guide
- `README.md` - Full API documentation
- `GET_STARTED.md` - Detailed setup instructions
- `MYSQL_SETUP_ALTERNATIVES.md` - MySQL installation options
- `QUICK_START.md` - Quick reference
- `RUN_NOW.md` - Command reference

## Requirements

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Support

All setup instructions are included in the documentation files. Start with `EXTRACT_AND_RUN.md` for the quickest path to running the backend.
