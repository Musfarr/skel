const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
    invoice_number: String,
    number: String,
    Name: String,
    Contact: String,
    Cnic: String,
    City: String,
    Date: Date,
    Store: String,
});

module.exports = mongoose.model('Participant', participantSchema, 'participants');
