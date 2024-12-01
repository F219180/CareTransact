const express = require('express');
const cors = require('cors');
const connectDB = require('./utils/db');
const authRouter = require('./router/auth_router');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000', methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);

// Database Connection and Server Start
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((error) => {
    console.error('Error connecting to the database:', error);
    process.exit(1);
});
