const mongoose = require('mongoose');


const newCustomerSchema = new mongoose.Schema({
    cust_cd : String,
    cust_name : String,  
})


module.exports = mongoose.model('CustomersWithGeoData', newCustomerSchema ,'CustomersWithGeoData');