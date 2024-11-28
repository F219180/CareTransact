// server/router/auth_router.js
const express = require('express');
const router = express.Router();
const User = require('../models/user.model');

router.route("/create-profile").post(async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            const newUser = new User({ email });
            await newUser.save();
            res.send({ message: 'Profile created successfully' });
        } else {
            res.send({ message: 'Profile already exists' });
        }
    } catch (error) {
        res.status(500).send({ message: 'Error creating profile' });
    }
});

module.exports = router;