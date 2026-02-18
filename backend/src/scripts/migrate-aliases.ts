import { connectDatabase, closeConnection } from '../config/database';
import { ChannelModel } from '../modules/channels/channel.model';
import { logger } from '../common/utils/logger';

async function migrate() {
    try {
        await connectDatabase();
        logger.info('Connected to database for migration');

        const channels = await ChannelModel.find({ alias: { $exists: false } });
        logger.info(`Found ${channels.length} channels without aliases`);

        const generateAlias = () => {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            let result = 'PAYL-';
            for (let i = 0; i < 6; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        };

        for (const channel of channels) {
            let alias = generateAlias();
            let isUnique = false;
            while (!isUnique) {
                const exists = await ChannelModel.findOne({ alias });
                if (!exists) {
                    isUnique = true;
                } else {
                    alias = generateAlias();
                }
            }

            channel.alias = alias;
            await channel.save();
            logger.info(`Assigned alias ${alias} to channel ${channel.name} (${channel.id})`);
        }

        logger.info('Migration completed successfully');
    } catch (error) {
        logger.error('Migration failed', error);
    } finally {
        await closeConnection();
    }
}

migrate();
