const express = require('express');
const router = express.Router();
const User = require('../models/user_models');

// Endpoint to save the user's email
router.post('/save-email', async (req, res) => {
    const { email } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({ email });
            await user.save();
        }
        res.status(200).json({ message: 'Email saved successfully', user });
    } catch (error) {
        res.status(500).json({ error: 'Error saving email' });
    }
});

module.exports = router;
