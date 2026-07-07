const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Check if Super Admin already exists
  const existingSuperAdmin = await prisma.user.findFirst({
    where: { role: 'SUPERADMIN' }
  });

  if (existingSuperAdmin) {
    console.log('✅ Super Admin already exists:', existingSuperAdmin.email);
    console.log('   Skipping seed creation.');
    return;
  }

  const hashedPassword = await bcrypt.hash('SuperAdmin@123', 10);
  
  const superAdmin = await prisma.user.create({
    data: {
      username: 'superadmin',
      email: 'superadmin@rsangha.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'SUPERADMIN',
      isVerified: true,
      isActive: true,
    },
  });
  
  console.log('✅ Super Admin created successfully!');
  console.log('📧 Email: superadmin@rsangha.com');
  console.log('🔑 Password: SuperAdmin@123');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });