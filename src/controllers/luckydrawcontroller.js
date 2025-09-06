const expressasyncHandler = require('express-async-handler');

const saveLuckydrawData = expressasyncHandler(async (req, res) => {
    try {
        res.status(200).json({ message: 'Luckydraw data saved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to save luckydraw data', error: error.message });
    }
});

module.exports = { saveLuckydrawData };
