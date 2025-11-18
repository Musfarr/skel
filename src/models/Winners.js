const mongoose = require("mongoose");


const winnersSchema = new mongoose.Schema({
    customerCode: String,
    customerName: String,
    wonTier: String,
    wonGiveaway: String,
    wonDate: String,
    zone: String,
    region: String,
    area: String,
    giveawayId: String,
    

}, 
{
     timestamps: true   
    },
)

module.exports = mongoose.model("Winners", winnersSchema);