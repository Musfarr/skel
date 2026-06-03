const expressasyncHandler = require('express-async-handler');
const ParticipantModel = require('../models/ParticipantModel');




// Getting New Sorted Customers Data

const getAllCustomerData = expressasyncHandler(async (req, res) => {
     try {
        
        const hasPageParam = req.query.page !== undefined;
        const hasLimitParam = req.query.limit !== undefined;
        const isPaginated = hasPageParam || hasLimitParam;

        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.max(1, Math.min(5000, parseInt(req.query.limit, 10) || 1000));
        const skip = (page - 1) * limit;
        const search = (req.query.search || '').trim();
        const city = req.query.city;

        const filter = {};

        if (city) {
            filter.City = { $regex: new RegExp(city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') };
        }

        if (search) {
            const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            filter.$or = [{ invoice_number: regex }, { Name: regex }, { Contact: regex }, { Cnic: regex }];
        }

        let data, total;
        if (isPaginated) {
            [data, total] = await Promise.all([
                ParticipantModel.find(filter).skip(skip).limit(limit),
                ParticipantModel.countDocuments(filter)
            ]);
        } else {
            data = await ParticipantModel.find(filter);
            total = data.length;
        }

        if (isPaginated) {
            const totalPages = Math.max(1, Math.ceil(total / limit));
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;

            return res.status(200).json({
                success: true,
                message: "Dashboard Data Generated Successfully",
                data,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNextPage,
                    hasPrevPage,
                    nextPage: hasNextPage ? page + 1 : null,
                    prevPage: hasPrevPage ? page - 1 : null
                }
            });
        } else {
            return res.status(200).json({
                success: true,
                message: "Dashboard Data Generated Successfully",
                data,
                pagination: {
                    total,
                    limit: null,
                    page: null
                }
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



module.exports = { getAllCustomerData };
