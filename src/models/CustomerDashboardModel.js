const mongoose = require('mongoose');


const customerSchema = new mongoose.Schema({
    DistributorCode : String,
    DistributorName : String,
    Region : String,
    ZONE: String,
    AREA: String,
    customerCode: String,
    customerName: String,
    totalGrossAmount: Number,
    entries: {
        platinumEntries: Number,
        goldEntries: Number,
        silverEntries: Number
    }
})

const dashboardDataSchema = new mongoose.Schema({
    Platinum: {
        count: Number,
        data: [customerSchema]
    },
    Gold: {
        count: Number,
        data: [customerSchema]
    },
    Silver: {
        count: Number,
        data: [customerSchema]
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});


module.exports = mongoose.model('CustomerData', dashboardDataSchema , "CustomerData");