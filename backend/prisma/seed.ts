import { PrismaClient, UserRole, OrderStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create companies
  const company1 = await prisma.company.upsert({
    where: { id: 'company-1' },
    update: {},
    create: {
      id: 'company-1',
      name: 'TechCorp Solutions',
      description: 'A leading technology company',
    },
  });

  const company2 = await prisma.company.upsert({
    where: { id: 'company-2' },
    update: {},
    create: {
      id: 'company-2',
      name: 'StartupXYZ',
      description: 'Innovative startup company',
    },
  });

  console.log('✅ Companies created');

  // Create users
  const adminUser = await prisma.user.upsert({
    where: { phone: '+1234567890' },
    update: {},
    create: {
      phone: '+1234567890',
      name: 'Admin User',
      email: 'admin@techcorp.com',
      role: UserRole.ADMIN,
      companyId: company1.id,
    },
  });

  const regularUser1 = await prisma.user.upsert({
    where: { phone: '+1234567891' },
    update: {},
    create: {
      phone: '+1234567891',
      name: 'John Doe',
      email: 'john@techcorp.com',
      role: UserRole.USER,
      companyId: company1.id,
    },
  });

  const regularUser2 = await prisma.user.upsert({
    where: { phone: '+1234567892' },
    update: {},
    create: {
      phone: '+1234567892',
      name: 'Jane Smith',
      email: 'jane@techcorp.com',
      role: UserRole.USER,
      companyId: company1.id,
    },
  });

  const startupUser = await prisma.user.upsert({
    where: { phone: '+1234567893' },
    update: {},
    create: {
      phone: '+1234567893',
      name: 'Bob Wilson',
      email: 'bob@startupxyz.com',
      role: UserRole.ADMIN,
      companyId: company2.id,
    },
  });

  console.log('✅ Users created');

  // Create menu items for TechCorp
  const menuItems = [
    {
      name: 'Chicken Caesar Salad',
      description: 'Fresh romaine lettuce with grilled chicken, parmesan cheese, and caesar dressing',
      price: 12.99,
      category: 'Salads',
      companyId: company1.id,
    },
    {
      name: 'Margherita Pizza',
      description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
      price: 15.99,
      category: 'Pizza',
      companyId: company1.id,
    },
    {
      name: 'Beef Burger',
      description: 'Juicy beef patty with lettuce, tomato, onion, and special sauce',
      price: 13.99,
      category: 'Burgers',
      companyId: company1.id,
    },
    {
      name: 'Vegetarian Wrap',
      description: 'Fresh vegetables wrapped in a whole wheat tortilla with hummus',
      price: 10.99,
      category: 'Wraps',
      companyId: company1.id,
    },
    {
      name: 'Chicken Teriyaki Bowl',
      description: 'Grilled chicken with teriyaki sauce over steamed rice and vegetables',
      price: 14.99,
      category: 'Asian',
      companyId: company1.id,
    },
    {
      name: 'Caesar Salad',
      description: 'Classic caesar salad with romaine lettuce and parmesan',
      price: 9.99,
      category: 'Salads',
      companyId: company1.id,
    },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { 
        id: `menu-${item.name.toLowerCase().replace(/\s+/g, '-')}` 
      },
      update: {},
      create: {
        id: `menu-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
        ...item,
      },
    });
  }

  // Create menu items for StartupXYZ
  const startupMenuItems = [
    {
      name: 'Avocado Toast',
      description: 'Smashed avocado on sourdough bread with cherry tomatoes',
      price: 8.99,
      category: 'Breakfast',
      companyId: company2.id,
    },
    {
      name: 'Quinoa Bowl',
      description: 'Quinoa with roasted vegetables and tahini dressing',
      price: 11.99,
      category: 'Healthy',
      companyId: company2.id,
    },
    {
      name: 'Fish Tacos',
      description: 'Grilled fish with cabbage slaw and chipotle mayo',
      price: 13.99,
      category: 'Mexican',
      companyId: company2.id,
    },
  ];

  for (const item of startupMenuItems) {
    await prisma.menuItem.upsert({
      where: { 
        id: `startup-menu-${item.name.toLowerCase().replace(/\s+/g, '-')}` 
      },
      update: {},
      create: {
        id: `startup-menu-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
        ...item,
      },
    });
  }

  console.log('✅ Menu items created');

  // Create order sessions
  const currentDate = new Date();
  const tomorrow = new Date(currentDate);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const orderSession1 = await prisma.orderSession.upsert({
    where: { id: 'session-1' },
    update: {},
    create: {
      id: 'session-1',
      title: 'Monday Lunch Order',
      description: 'Weekly team lunch order',
      startTime: new Date(tomorrow.getTime() + 9 * 60 * 60 * 1000), // 9 AM tomorrow
      endTime: new Date(tomorrow.getTime() + 11 * 60 * 60 * 1000), // 11 AM tomorrow
      companyId: company1.id,
      createdById: adminUser.id,
    },
  });

  const orderSession2 = await prisma.orderSession.upsert({
    where: { id: 'session-2' },
    update: {},
    create: {
      id: 'session-2',
      title: 'Friday Team Dinner',
      description: 'End of week celebration dinner',
      startTime: new Date(tomorrow.getTime() + 17 * 60 * 60 * 1000), // 5 PM tomorrow
      endTime: new Date(tomorrow.getTime() + 19 * 60 * 60 * 1000), // 7 PM tomorrow
      companyId: company1.id,
      createdById: adminUser.id,
    },
  });

  console.log('✅ Order sessions created');

  // Create sample orders
  const menuItem1 = await prisma.menuItem.findFirst({
    where: { name: 'Chicken Caesar Salad' },
  });

  const menuItem2 = await prisma.menuItem.findFirst({
    where: { name: 'Margherita Pizza' },
  });

  if (menuItem1 && menuItem2) {
    const order1 = await prisma.order.upsert({
      where: { id: 'order-1' },
      update: {},
      create: {
        id: 'order-1',
        status: OrderStatus.CONFIRMED,
        totalAmount: 12.99,
        notes: 'Extra dressing on the side',
        userId: regularUser1.id,
        sessionId: orderSession1.id,
      },
    });

    const order2 = await prisma.order.upsert({
      where: { id: 'order-2' },
      update: {},
      create: {
        id: 'order-2',
        status: OrderStatus.PENDING,
        totalAmount: 15.99,
        userId: regularUser2.id,
        sessionId: orderSession1.id,
      },
    });

    // Create order items
    await prisma.orderItem.upsert({
      where: { id: 'order-item-1' },
      update: {},
      create: {
        id: 'order-item-1',
        quantity: 1,
        price: 12.99,
        notes: 'Extra dressing on the side',
        orderId: order1.id,
        menuItemId: menuItem1.id,
      },
    });

    await prisma.orderItem.upsert({
      where: { id: 'order-item-2' },
      update: {},
      create: {
        id: 'order-item-2',
        quantity: 1,
        price: 15.99,
        orderId: order2.id,
        menuItemId: menuItem2.id,
      },
    });

    console.log('✅ Sample orders created');
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
