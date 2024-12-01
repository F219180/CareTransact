const mongoose = require('mongoose');
require('dotenv').config();

const URI = process.env.MONGO_URI;
const connectDB = async () => {
    try {
        await mongoose.connect(URI);
        console.log('DB is connected');
    } catch (error) {
        console.log(error);
        process.exit(0);
    }
}

module.exports = connectDB;
