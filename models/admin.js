const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For hashing passwords

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensure each admin has a unique email
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    }
});

// Pre-save middleware to hash the password before saving
adminSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Method to compare passwords
adminSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);
