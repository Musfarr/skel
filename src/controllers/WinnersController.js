const expressasyncHandler = require("express-async-handler");
const Winners = require("../models/Winners");



const getWinnersData = expressasyncHandler(async (req, res) => {
    const winners = await Winners.find();
    res.status(200).json(winners);
});


const AddWinner = expressasyncHandler(async (req, res) => {
    const winner = await Winners.create(req.body);
    res.status(200).json(winner);
});


const ClearWinnersData = expressasyncHandler(async (req, res) => {
    const winner = await Winners.deleteMany();
    res.status(200).json({message: "Winners Data Cleared"});
});


module.exports = { getWinnersData, AddWinner, ClearWinnersData };