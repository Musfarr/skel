const express = require('express');
const router = express.Router();
const { saveDistributorData, getDistributorSummary , getDistributorData } = require('../controllers/distributorController');
const { saveLuckydrawData } = require('../controllers/luckydrawcontroller');
const { getCustomerDashboardData } = require('../controllers/CustomerDashboardController');

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });


// transform distributor data
router.get("/distributor-data", getDistributorData);

// Customer Dashboard Data
router.get("/customer-dashboard-data", getCustomerDashboardData);







// File upload routes
// router.post("/distributor-data", upload.fields([{name: 'file'}]), saveDistributorData);
// router.post("/luckydraw-data", upload.single('file'), saveLuckydrawData);
// // Data analysis routes
// router.get("/distributor-summary", getDistributorSummary);




module.exports = router;