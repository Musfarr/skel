const expressasyncHandler = require("express-async-handler");
const Winners = require("../models/Winners");
const xlsx = require('xlsx')



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


const GetWinnersCsv = expressasyncHandler(async (req , res) => {

    const winners = await Winners.find()

    const row = winners.map((w) => ({
      customerCode: w.customerCode,
      customerName: w.customerName,
      wonTier: w.wonTier,
      wonGiveaway: w.wonGiveaway,
      wonDate: w.wonDate,
      zone: w.zone,
      region: w.region,
      area: w.area,
      giveawayId: w.giveawayId,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
    }))


    const worksheet = xlsx.utils.json_to_sheet(row);
    const workbook = xlsx.utils.book_new();

    xlsx.utils.book_append_sheet(workbook , worksheet , 'Winners');

    const buffer = xlsx.write(workbook , {type : "buffer" , bookType :"xlsx"});

    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader("Content-Disposition", 'attachment; filename="winners.xlsx"');

    return res.status(200).send(buffer);
})


module.exports = { getWinnersData, AddWinner, ClearWinnersData ,GetWinnersCsv};