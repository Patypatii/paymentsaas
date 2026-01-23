import { connectDatabase, closeConnection } from '../config/database';
import { hashPassword } from '../common/utils/crypto';
import { config } from '../config/env';
import { logger } from '../common/utils/logger';
import { AdminModel } from '../modules/admin/admin.model';

async function seedDatabase(): Promise<void> {
  try {
    // Connect to MongoDB
    await connectDatabase();

    logger.info('Seeding database...');

    // Create default admin user
    const adminPasswordHash = await hashPassword(config.admin.password);

    await AdminModel.findOneAndUpdate(
      { email: config.admin.email },
      {
        email: config.admin.email,
        passwordHash: adminPasswordHash,
        role: 'SUPER_ADMIN',
      },
      { upsert: true, new: true }
    );

    logger.info('Database seeded successfully');
    logger.info(`Admin user created/updated: ${config.admin.email}`);
  } catch (error: any) {
    logger.error('Seeding failed', error);
    throw error;
  } finally {
    await closeConnection();
  }
}

seedDatabase().catch((error) => {
  logger.error('Seed script failed', error);
  process.exit(1);
});
