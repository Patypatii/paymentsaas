import { readFileSync } from 'fs';
import { join } from 'path';
import { pool } from '../config/database';
import { logger } from '../common/utils/logger';

async function runMigrations(): Promise<void> {
  try {
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    logger.info('Running database migrations...');
    await pool.query(schema);
    logger.info('Database migrations completed successfully');
  } catch (error: any) {
    logger.error('Migration failed', error);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigrations().catch((error) => {
  logger.error('Migration script failed', error);
  process.exit(1);
});
