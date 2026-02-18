const mongoose = require('mongoose');
// Initial URI without specific database to explore
const baseUri = 'mongodb+srv://paylor:paylor123@cluster0.rufsm1d.mongodb.net/';

async function explore() {
    try {
        console.log('Connecting to MongoDB Cluster...');
        await mongoose.connect(baseUri);
        const admin = mongoose.connection.db.admin();

        console.log('Listing databases...');
        const dbs = await admin.listDatabases();
        console.log('Databases found:', dbs.databases.map(db => db.name).join(', '));

        for (const dbInfo of dbs.databases) {
            const dbName = dbInfo.name;
            if (['admin', 'local', 'config'].includes(dbName)) continue;

            console.log(`\nChecking database: ${dbName}`);
            const db = mongoose.connection.useDb(dbName);
            const collections = await db.db.listCollections().toArray();
            const colNames = collections.map(c => c.name);
            console.log('Collections:', colNames.join(', '));

            if (colNames.includes('merchants') || colNames.includes('apikeys')) {
                console.log(`Found relevant data in [${dbName}]!`);

                // Try to find the merchant in this DB
                const merchant = await db.collection('merchants').findOne({ username: 'patypatii' });
                if (merchant) {
                    console.log(`SUCCESS! Found Merchant "patypatii" in [${dbName}] with ID: ${merchant._id}`);
                    const keys = await db.collection('apikeys').find({ merchantId: merchant._id }).toArray();
                    console.log('\n--- YOUR API KEYS ---');
                    keys.forEach(k => {
                        console.log(`Name:   ${k.name}`);
                        console.log(`ID:     ${k._id}`);
                        console.log(`Active: ${k.isActive}`);
                        console.log('-------------------------');
                    });
                    process.exit(0);
                }
            }
        }
        console.log('\nCould not find merchant "patypatii" in any accessible database.');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.disconnect();
    }
}

explore();
