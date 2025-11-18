const express = require('express');
const router = express.Router();
const { getAllCustomerData } = require('../controllers/distributorController');
const { getWinnersData , AddWinner , ClearWinnersData } = require('../controllers/WinnersController');






// winners data
router.get("/winners-data", getWinnersData);
router.post("/add-winner", AddWinner);
router.delete("/clear-winners-data", ClearWinnersData);

// new format data 
router.get("/new-customer-data", getAllCustomerData);







module.exports = router;