const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDemoUser() {
  // Connect to database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('Connected to database');

  // Demo user credentials
  const demoUser = {
    email: 'demo@rosebudglobal.com',
    password: 'Demo@123456',
    firstName: 'Demo',
    lastName: 'User',
    role: 'admin'
  };

  // Super admin credentials
  const superAdmin = {
    email: 'admin@rosebudglobal.com',
    password: 'Admin@123456',
    firstName: 'Super',
    lastName: 'Admin',
    role: 'super_admin'
  };

  try {
    // Hash passwords
    const demoPasswordHash = await bcrypt.hash(demoUser.password, 10);
    const adminPasswordHash = await bcrypt.hash(superAdmin.password, 10);

    console.log('\n=== DEMO USER ===');
    console.log('Email:', demoUser.email);
    console.log('Password:', demoUser.password);
    console.log('Hash:', demoPasswordHash);

    console.log('\n=== SUPER ADMIN ===');
    console.log('Email:', superAdmin.email);
    console.log('Password:', superAdmin.password);
    console.log('Hash:', adminPasswordHash);

    // Check if users exist
    const [existingDemo] = await connection.query(
      'SELECT id FROM admin_users WHERE email = ?',
      [demoUser.email]
    );

    const [existingAdmin] = await connection.query(
      'SELECT id FROM admin_users WHERE email = ?',
      [superAdmin.email]
    );

    // Insert or update demo user
    if (existingDemo.length > 0) {
      await connection.query(
        'UPDATE admin_users SET password = ?, first_name = ?, last_name = ?, role = ?, is_active = 1 WHERE email = ?',
        [demoPasswordHash, demoUser.firstName, demoUser.lastName, demoUser.role, demoUser.email]
      );
      console.log('\n✓ Demo user updated');
    } else {
      await connection.query(
        'INSERT INTO admin_users (email, password, first_name, last_name, role, is_active) VALUES (?, ?, ?, ?, ?, 1)',
        [demoUser.email, demoPasswordHash, demoUser.firstName, demoUser.lastName, demoUser.role]
      );
      console.log('\n✓ Demo user created');
    }

    // Insert or update super admin
    if (existingAdmin.length > 0) {
      await connection.query(
        'UPDATE admin_users SET password = ?, first_name = ?, last_name = ?, role = ?, is_active = 1 WHERE email = ?',
        [adminPasswordHash, superAdmin.firstName, superAdmin.lastName, superAdmin.role, superAdmin.email]
      );
      console.log('✓ Super admin updated');
    } else {
      await connection.query(
        'INSERT INTO admin_users (email, password, first_name, last_name, role, is_active) VALUES (?, ?, ?, ?, ?, 1)',
        [superAdmin.email, adminPasswordHash, superAdmin.firstName, superAdmin.lastName, superAdmin.role]
      );
      console.log('✓ Super admin created');
    }

    console.log('\n=== CREDENTIALS FOR TESTING ===');
    console.log('Demo User:');
    console.log('  Email: demo@rosebudglobal.com');
    console.log('  Password: Demo@123456');
    console.log('  Role: Admin');
    console.log('\nSuper Admin:');
    console.log('  Email: admin@rosebudglobal.com');
    console.log('  Password: Admin@123456');
    console.log('  Role: Super Admin');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
    console.log('\nDatabase connection closed');
  }
}

createDemoUser();
