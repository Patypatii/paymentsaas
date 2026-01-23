import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://paylor:paylor123@cluster0.rufsm1d.mongodb.net/paylor?retryWrites=true&w=majority';

async function inspectChannel() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const channelId = '69729e9a024fb7482c41d54e';
        const db = mongoose.connection.db;

        if (!db) {
            throw new Error('Database connection established but db object is undefined');
        }

        const channel = await db.collection('channels').findOne({ _id: new mongoose.Types.ObjectId(channelId) });

        if (channel) {
            console.log('Channel found:', JSON.stringify(channel, null, 2));
        } else {
            console.log('Channel NOT found');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

inspectChannel();
