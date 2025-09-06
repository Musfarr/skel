const express = require('express');
const cors = require('cors');
const Excelroutes = require("./routes/Excelroutes");
const app = express();

// Middlewares
app.use(cors({
    origin: "*"
}));
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'unilever-campaign-backend' });
});

app.use("/api", Excelroutes);

module.exports = app;
