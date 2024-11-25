require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./utils/db');
const router = require('./router/auth_router');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', router);

const PORT = 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
