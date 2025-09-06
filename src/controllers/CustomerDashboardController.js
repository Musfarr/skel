const expressasyncHandler = require('express-async-handler');
const CustomerDashboardModel = require('../models/CustomerDashboardModel');

const getCustomerDashboardData = expressasyncHandler(async (req, res) => {
    try {
        const customerDashboardData = await CustomerDashboardModel.findOne().sort({ lastUpdated: -1 });
        return res.status(200).json({
            success: true,
            message: "Customer Dashboard Data Fetched Successfully",
            data: customerDashboardData,
        });
        
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message });
    }
});

module.exports = { getCustomerDashboardData };
