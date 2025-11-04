const express = require('express');
const cors = require('cors');

const Excelroutes = require("./routes/Excelroutes");
const Authroutes = require("./routes/Authroutes");
const bodyParser = require('body-parser');
const app = express();

// Middlewares
app.use(cors({
    origin: "*"
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'unilever-campaign-backend' });
});

app.use("/api", Excelroutes);
app.use("/api", Authroutes);

module.exports = app;
