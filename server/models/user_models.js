const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: String,
    age: Number,
    address: String,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
