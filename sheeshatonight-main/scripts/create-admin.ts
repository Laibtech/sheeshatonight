import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists:');
      console.log('Email:', existingAdmin.email);
      console.log('Name:', existingAdmin.name);
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@sheeshatonight.com',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        verified: true,
        kycStatus: 'APPROVED',
      }
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@sheeshatonight.com');
    console.log('Password: admin123');
    console.log('');
    console.log('You can now login at: http://localhost:3001/auth/login');
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
