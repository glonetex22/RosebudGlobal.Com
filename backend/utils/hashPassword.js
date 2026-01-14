const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Run this to generate hash for default admin
if (require.main === module) {
  const defaultPassword = process.argv[2] || 'Admin@123456';
  hashPassword(defaultPassword).then(hash => {
    console.log('\n========================================');
    console.log('Password hash for:', defaultPassword);
    console.log('========================================');
    console.log(hash);
    console.log('========================================\n');
    console.log('Update schema.sql with this hash in the admin_users INSERT statement\n');
  }).catch(error => {
    console.error('Error hashing password:', error);
    process.exit(1);
  });
}

module.exports = hashPassword;
