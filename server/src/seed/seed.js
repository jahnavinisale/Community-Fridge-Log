import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB, closeDB } from '../config/db.js';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { Fridge } from '../models/Fridge.js';
import { Item } from '../models/Item.js';
import { LogEntry } from '../models/LogEntry.js';

export const populateData = async () => {
  try {
    console.log('[Seed] Clearing existing database collections...');
    await Promise.all([
      User.deleteMany({}),
      Fridge.deleteMany({}),
      Item.deleteMany({}),
      LogEntry.deleteMany({}),
    ]);

    console.log(`[Seed] Creating admin user from environment variables (${config.adminEmail})...`);
    const adminPasswordHash = await bcrypt.hash(config.adminPassword, 10);
    const volunteerPasswordHash = await bcrypt.hash('Volunteer123!', 10);

    const admin = await User.create({
      name: config.adminName,
      email: config.adminEmail.toLowerCase(),
      passwordHash: adminPasswordHash,
      role: 'admin',
      phone: '+44 7700 900123',
      isActive: true,
    });

    const volunteer1 = await User.create({
      name: 'Sarah Jenkins (Volunteer)',
      email: 'sarah.volunteer@communityfridge.org',
      passwordHash: volunteerPasswordHash,
      role: 'volunteer',
      phone: '+44 7700 900456',
      isActive: true,
    });

    const volunteer2 = await User.create({
      name: 'Marcus Chen (Volunteer)',
      email: 'marcus.volunteer@communityfridge.org',
      passwordHash: volunteerPasswordHash,
      role: 'volunteer',
      phone: '+44 7700 900789',
      isActive: true,
    });

    console.log('[Seed] Creating default fridge location...');
    const fridge = await Fridge.create({
      name: 'Main Community Fridge',
      location: 'Community Hub Courtyard, 104 High Street, Camden',
      capacityLitres: 450,
      temperatureCelsius: 3.2,
      isDefault: true,
      notes: 'Monitored twice daily by volunteers. Ambient dry shelving adjacent.',
    });

    console.log('[Seed] Generating sample food items clearly marked as sample data...');
    const now = new Date();
    
    const getRelativeDate = (offsetDays, hours = 12) => {
      const d = new Date(now);
      d.setDate(d.getDate() + offsetDays);
      d.setHours(hours, 0, 0, 0);
      return d;
    };

    const sampleItems = [
      // 1. EXPIRED items (past use-by date)
      {
        name: '[SAMPLE] Pre-packed Caesar Salad Bowls',
        category: 'cooked meal',
        quantity: 3,
        unit: 'packs',
        useByDate: getRelativeDate(-2),
        dateReceived: getRelativeDate(-5),
        donatedBy: 'Green Fork Deli',
        storageLocation: 'fridge',
        status: 'in_stock',
        storageNote: 'Chilled ready-to-eat shelf',
        allergensNote: 'Contains dairy dressing and wheat croutons',
        notes: 'Needs immediate disposal check. Past legal use-by date.',
        fridge: fridge._id,
        addedBy: volunteer1._id,
        createdBy: volunteer1._id,
      },
      {
        name: '[SAMPLE] Organic Greek Yogurt 500g',
        category: 'dairy',
        quantity: 2,
        unit: 'items',
        useByDate: getRelativeDate(-1),
        dateReceived: getRelativeDate(-6),
        donatedBy: 'Highland Dairy Co.',
        storageLocation: 'fridge',
        status: 'in_stock',
        allergensNote: 'Contains pasteurised milk',
        notes: 'Check seal and smell before disposal or review.',
        fridge: fridge._id,
        addedBy: volunteer2._id,
        createdBy: volunteer2._id,
      },

      // 2. USE TODAY items (due today)
      {
        name: '[SAMPLE] Fresh Semi-Skimmed Milk 2L',
        category: 'dairy',
        quantity: 5,
        unit: 'items',
        useByDate: getRelativeDate(0, 18),
        dateReceived: getRelativeDate(-2),
        donatedBy: 'Co-op Supermarket',
        storageLocation: 'fridge',
        status: 'in_stock',
        storageNote: 'Top shelf chilled below 4 C',
        allergensNote: 'Contains milk',
        notes: 'Highlight on front shelf for urgent collection.',
        fridge: fridge._id,
        addedBy: volunteer1._id,
        createdBy: volunteer1._id,
      },
      {
        name: '[SAMPLE] Roasted Mediterranean Veggie Lasagna',
        category: 'cooked meal',
        quantity: 4,
        unit: 'packs',
        useByDate: getRelativeDate(0, 21),
        dateReceived: getRelativeDate(-1),
        donatedBy: 'Community Kitchen Hub',
        storageLocation: 'fridge',
        status: 'in_stock',
        storageNote: 'Prepared meals section',
        allergensNote: 'Contains wheat, celery, and milk',
        notes: 'Cook thoroughly before consumption.',
        fridge: fridge._id,
        addedBy: admin._id,
        createdBy: admin._id,
      },

      // 3. SOON items (1 to 2 days remaining)
      {
        name: '[SAMPLE] Mature Cheddar Cheese Block 400g',
        category: 'dairy',
        quantity: 6,
        unit: 'packs',
        useByDate: getRelativeDate(1),
        dateReceived: getRelativeDate(-3),
        donatedBy: 'Local Corner Shop',
        storageLocation: 'fridge',
        status: 'in_stock',
        allergensNote: 'Contains milk',
        notes: 'Unopened manufacturer vacuum packaging.',
        fridge: fridge._id,
        addedBy: volunteer1._id,
        createdBy: volunteer1._id,
      },
      {
        name: '[SAMPLE] Artisan Seeded Sourdough Loaves',
        category: 'bakery',
        quantity: 4,
        unit: 'loaves',
        useByDate: getRelativeDate(2),
        dateReceived: getRelativeDate(0),
        donatedBy: 'Crust & Crumb Bakery',
        storageLocation: 'pantry',
        status: 'in_stock',
        storageNote: 'Ambient bread rack shelf 1',
        allergensNote: 'Contains wheat and sesame seeds',
        notes: 'Freshly baked this morning.',
        fridge: fridge._id,
        addedBy: volunteer1._id,
        createdBy: volunteer1._id,
      },

      // 4. OK items (3+ days remaining)
      {
        name: '[SAMPLE] Crisp Gala Apples Bag 1.5kg',
        category: 'produce',
        quantity: 8,
        unit: 'packs',
        useByDate: getRelativeDate(6),
        dateReceived: getRelativeDate(0),
        donatedBy: 'Sunny Orchard Co-op',
        storageLocation: 'fridge',
        status: 'in_stock',
        storageNote: 'Produce crisper drawer',
        notes: 'Washed and inspected upon arrival.',
        fridge: fridge._id,
        addedBy: volunteer1._id,
        createdBy: volunteer1._id,
      },
      {
        name: '[SAMPLE] Organic Carrots Bunches',
        category: 'produce',
        quantity: 5,
        unit: 'bunches',
        useByDate: getRelativeDate(7),
        dateReceived: getRelativeDate(-1),
        donatedBy: 'Greengrocer Market',
        storageLocation: 'fridge',
        status: 'in_stock',
        fridge: fridge._id,
        addedBy: volunteer2._id,
        createdBy: volunteer2._id,
      },
      {
        name: '[SAMPLE] Canned Crushed Plum Tomatoes 400g',
        category: 'packaged',
        quantity: 16,
        unit: 'cans',
        useByDate: getRelativeDate(60),
        dateReceived: getRelativeDate(-4),
        donatedBy: 'Neighbourhood Food Drive',
        storageLocation: 'pantry',
        status: 'in_stock',
        storageNote: 'Ambient pantry shelf 2',
        notes: 'Intact cans without dents or bulging.',
        fridge: fridge._id,
        addedBy: volunteer1._id,
        createdBy: volunteer1._id,
      },
      {
        name: '[SAMPLE] Barista Oat Milk Cartons 1L',
        category: 'drinks',
        quantity: 8,
        unit: 'items',
        useByDate: getRelativeDate(25),
        dateReceived: getRelativeDate(-2),
        donatedBy: 'Roast Coffee Bar',
        storageLocation: 'pantry',
        status: 'in_stock',
        storageNote: 'Ambient shelf',
        allergensNote: 'Contains oats (gluten-free certified)',
        fridge: fridge._id,
        addedBy: admin._id,
        createdBy: admin._id,
      },
    ];

    const createdItems = await Item.insertMany(sampleItems);
    console.log(`[Seed] Inserted ${createdItems.length} active sample items.`);

    console.log('[Seed] Generating historical donation intake logs...');
    const intakeLogs = createdItems.map((item) => ({
      type: 'intake',
      item: item._id,
      itemName: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      note: `Donation received from ${item.donatedBy}. Initial intake verification passed.`,
      notes: `Donation received from ${item.donatedBy}. Initial intake verification passed.`,
      performedBy: item.addedBy,
      performedByName: item.addedBy.equals(admin._id)
        ? admin.name
        : item.addedBy.equals(volunteer1._id)
        ? volunteer1.name
        : volunteer2.name,
      fridge: fridge._id,
      createdAt: item.dateReceived,
    }));
    await LogEntry.insertMany(intakeLogs);

    console.log('[Seed] Generating sample collection logs...');
    const collectionLogs = [
      {
        type: 'collection',
        itemName: '[SAMPLE] Sourdough Baguettes',
        category: 'bakery',
        quantity: 5,
        unit: 'loaves',
        reason: 'community_pickup',
        note: 'Collected by elderly resident support volunteer group.',
        notes: 'Collected by elderly resident support volunteer group.',
        performedBy: volunteer1._id,
        performedByName: volunteer1.name,
        fridge: fridge._id,
        createdAt: getRelativeDate(-1, 14),
      },
      {
        type: 'collection',
        itemName: '[SAMPLE] Fresh Vegetable Stew Bowls',
        category: 'cooked meal',
        quantity: 6,
        unit: 'packs',
        reason: 'emergency_relief',
        note: 'Collected for local family emergency hamper distribution.',
        notes: 'Collected for local family emergency hamper distribution.',
        performedBy: volunteer2._id,
        performedByName: volunteer2.name,
        fridge: fridge._id,
        createdAt: getRelativeDate(-2, 11),
      },
    ];
    await LogEntry.insertMany(collectionLogs);

    console.log('[Seed] Generating sample disposal logs with mandatory reasons...');
    const disposalLogs = [
      {
        type: 'disposal',
        itemName: '[SAMPLE] Natural Set Strawberry Yogurt',
        category: 'dairy',
        quantity: 3,
        unit: 'items',
        reason: 'expired',
        note: 'Past use-by date by 3 days. Safely discarded in organic waste.',
        notes: 'Past use-by date by 3 days. Safely discarded in organic waste.',
        performedBy: volunteer1._id,
        performedByName: volunteer1.name,
        fridge: fridge._id,
        createdAt: getRelativeDate(-1, 17),
      },
      {
        type: 'disposal',
        itemName: '[SAMPLE] Soft Strawberries Punnet',
        category: 'produce',
        quantity: 2,
        unit: 'packs',
        reason: 'spoiled',
        note: 'Found white mold developing on lower layer berries.',
        notes: 'Found white mold developing on lower layer berries.',
        performedBy: volunteer2._id,
        performedByName: volunteer2.name,
        fridge: fridge._id,
        createdAt: getRelativeDate(-2, 10),
      },
      {
        type: 'disposal',
        itemName: '[SAMPLE] Canned Baked Beans in Sauce',
        category: 'packaged',
        quantity: 1,
        unit: 'cans',
        reason: 'damaged_packaging',
        note: 'Severe dent along seam of can compromising airtight seal.',
        notes: 'Severe dent along seam of can compromising airtight seal.',
        performedBy: admin._id,
        performedByName: admin.name,
        fridge: fridge._id,
        createdAt: getRelativeDate(-3, 15),
      },
      {
        type: 'disposal',
        itemName: '[SAMPLE] Brand X Sesame Crackers',
        category: 'packaged',
        quantity: 4,
        unit: 'boxes',
        reason: 'recalled',
        note: 'FSA batch recall notice #2026-88 (undeclared peanut allergen).',
        notes: 'FSA batch recall notice #2026-88 (undeclared peanut allergen).',
        performedBy: admin._id,
        performedByName: admin.name,
        fridge: fridge._id,
        createdAt: getRelativeDate(-5, 13),
      },
      {
        type: 'disposal',
        itemName: '[SAMPLE] Defrosted Mixed Dumplings',
        category: 'cooked meal',
        quantity: 2,
        unit: 'packs',
        reason: 'other',
        note: 'Donor left package on warm counter outside freezer for unknown duration.',
        notes: 'Donor left package on warm counter outside freezer for unknown duration.',
        performedBy: volunteer2._id,
        performedByName: volunteer2.name,
        fridge: fridge._id,
        createdAt: getRelativeDate(-6, 18),
      },
    ];
    await LogEntry.insertMany(disposalLogs);

    console.log('[Seed] Database seeding completed successfully!');
    console.log('======================================================');
    console.log(`ADMIN ACCOUNT (FROM ENV):`);
    console.log(`  Name:     ${config.adminName}`);
    console.log(`  Email:    ${config.adminEmail}`);
    console.log(`  Password: ${config.adminPassword}`);
    console.log('VOLUNTEER ACCOUNTS:');
    console.log('  Sarah:    sarah.volunteer@communityfridge.org / Volunteer123!');
    console.log('  Marcus:   marcus.volunteer@communityfridge.org / Volunteer123!');
    console.log('======================================================');
    return true;
  } catch (err) {
    console.error('[Seed] Error during data population:', err);
    throw err;
  }
};

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();
    await populateData();
    await closeDB();
    console.log('[Seed] Database seeding completed and connection closed.');
    return true;
  } catch (err) {
    console.error('[Seed] Error during database seeding:', err);
    await closeDB();
    throw err;
  }
};

// Execute if run directly from CLI
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
