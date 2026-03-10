import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Customer from '../models/Customer.js';
import Analytics from '../models/Analytics.js';
import connectDB from '../config/database.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Customer.deleteMany({});
    await Analytics.deleteMany({});

    console.log('Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      tenantId: 'default',
      permissions: ['read', 'write', 'delete', 'admin'],
    });

    // Create manager user
    const managerUser = await User.create({
      name: 'Manager User',
      email: 'manager@example.com',
      password: 'manager123',
      role: 'manager',
      tenantId: 'default',
      permissions: ['read', 'write'],
    });

    // Create viewer user
    const viewerUser = await User.create({
      name: 'Viewer User',
      email: 'viewer@example.com',
      password: 'viewer123',
      role: 'viewer',
      tenantId: 'default',
      permissions: ['read'],
    });

    console.log('Created users');

    // Create sample customers
    const customers = [];
    for (let i = 1; i <= 20; i++) {
      customers.push({
        name: `Customer ${i}`,
        email: `customer${i}@example.com`,
        company: `Company ${i}`,
        phone: `+1-555-00${String(i).padStart(2, '0')}`,
        status: ['active', 'inactive', 'pending'][Math.floor(Math.random() * 3)],
        value: Math.floor(Math.random() * 100000) + 10000,
        tenantId: 'default',
        createdBy: adminUser._id,
      });
    }
    await Customer.insertMany(customers);
    console.log('Created customers');

    // Create sample analytics data
    const analytics = [];
    const now = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      analytics.push({
        date,
        pageViews: Math.floor(Math.random() * 10000) + 5000,
        uniqueVisitors: Math.floor(Math.random() * 5000) + 2000,
        sessions: Math.floor(Math.random() * 8000) + 3000,
        bounceRate: Math.floor(Math.random() * 40) + 20,
        avgSessionDuration: Math.floor(Math.random() * 300) + 60,
        conversions: Math.floor(Math.random() * 500) + 100,
        revenue: Math.floor(Math.random() * 50000) + 10000,
        tenantId: 'default',
      });
    }
    await Analytics.insertMany(analytics);
    console.log('Created analytics data');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nSample Users:');
    console.log('  Admin: admin@example.com / admin123');
    console.log('  Manager: manager@example.com / manager123');
    console.log('  Viewer: viewer@example.com / viewer123');

    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedDatabase();
