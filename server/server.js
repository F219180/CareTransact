require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./utils/db');
const app=express();
const router = require('./router/auth_router');
const connectDB = require("./utils/db");
app.use(cors());
app.use(express.json());
app.use('/api/auth', router);

const PORT = 5000;
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`server is running at port:${PORT}`);
    });
}).catch((error) => {
    console.error('Error connecting to database:', error);
    process.exit(1);
});
