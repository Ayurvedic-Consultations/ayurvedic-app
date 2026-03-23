require('dotenv').config();
const mongoose = require('mongoose');

async function fixIndex() {
    try {
        await mongoose.connect(process.env.MDB);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('whatsappsessions');

        const indexes = await collection.indexes();
        console.log('Current indexes:', indexes.map(i => i.name));

        // Check if whatsappNumber_1 exists and drop it
        if (indexes.some(i => i.name === 'whatsappNumber_1')) {
            await collection.dropIndex('whatsappNumber_1');
            console.log('✅ Successfully dropped old whatsappNumber_1 index!');
        } else {
            console.log('The index does not exist.');
        }
    } catch (err) {
        if (err.codeName === 'IndexNotFound') {
            console.log('Index was already dropped.');
        } else {
            console.error('Error:', err);
        }
    } finally {
        await mongoose.disconnect();
    }
}

fixIndex();
