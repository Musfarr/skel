const mongoose = require("mongoose");

const winnersSchema = new mongoose.Schema({
    invoice_number: String,
    Name: String,
    Contact: String,
    Cnic: String,
    City: String,
    parsedOutlet: String,
    wonTier: String,
    wonGiveaway: String,
    wonDate: String,
    giveawayId: String,
},
{
    timestamps: true,
});

module.exports = mongoose.model("Winners", winnersSchema);