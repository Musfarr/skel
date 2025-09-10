const mongoose = require('mongoose');


const distributorSchema = new mongoose.Schema({
    WEEK: String,
    REGION: String,
    DIST_CD: String,
    DIST_NAME: String,
    CUST_CD: String,
    CUST_NAME: String,
    PRDCAT_CD: String,
    INV_NO: String,
    DELIVERY_DT: String,
    SKU: String,
    SKU_DESC: String,
    Format: String,
    GROSS_AMT: Number
}, {
    timestamps: true
}
)

module.exports = mongoose.model('Distributor data', distributorSchema , "Distributor data");
