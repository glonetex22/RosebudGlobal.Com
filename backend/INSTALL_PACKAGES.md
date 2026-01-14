# Install Required Packages for Admin Authentication

Run the following command in the backend directory to install all required packages:

```bash
cd backend
npm install express mysql2 bcryptjs jsonwebtoken cors dotenv multer sharp uuid express-validator helmet morgan
```

## Package Descriptions

- **express** - Web framework (already installed)
- **mysql2** - MySQL client (already installed)
- **bcryptjs** - Password hashing (already installed)
- **jsonwebtoken** - JWT authentication (already installed)
- **cors** - Cross-origin resource sharing (already installed)
- **dotenv** - Environment variables (already installed)
- **multer** - File upload handling
- **sharp** - Image processing
- **uuid** - Generate unique IDs
- **express-validator** - Request validation
- **helmet** - Security headers
- **morgan** - HTTP request logger

## Check Currently Installed

To check which packages are already installed:

```bash
npm list express mysql2 bcryptjs jsonwebtoken cors dotenv multer sharp uuid express-validator helmet morgan
```

## Install Missing Packages Only

If some packages are already installed, you can install only the missing ones:

```bash
npm install multer sharp uuid express-validator helmet morgan
```
