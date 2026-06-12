const express = require('express');
const router = express.Router();
const { getAllCustomerData } = require('../controllers/distributorController');
const { getWinnersData , AddWinner , ClearWinnersData , GetWinnersCsv } = require('../controllers/WinnersController');
const protect = require('../middleware/auth');





// winners data
router.get("/winners-data",protect, getWinnersData);
router.post("/add-winner", protect, AddWinner);
router.delete("/clear-winners-data",protect, ClearWinnersData);
router.get("/winners-csv", GetWinnersCsv);

// new format data 
router.get("/new-customer-data", protect,  getAllCustomerData);







module.exports = router;