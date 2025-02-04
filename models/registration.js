const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    eventId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Event', 
        required: true 
    },
    registrationDate: { 
        type: Date, 
        default: Date.now 
    }
});

const Registration = mongoose.model('Registration', registrationSchema);
module.exports = Registration;
