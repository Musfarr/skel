const express = require('express');
const router = express.Router();
const { getAllCustomerData } = require('../controllers/distributorController');
const { getWinnersData , AddWinner , ClearWinnersData , GetWinnersCsv } = require('../controllers/WinnersController');






// winners data
router.get("/winners-data", getWinnersData);
router.post("/add-winner", AddWinner);
router.delete("/clear-winners-data", ClearWinnersData);
router.get("/winners-csv", GetWinnersCsv);

// new format data 
router.get("/new-customer-data", getAllCustomerData);







module.exports = router;