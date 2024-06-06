require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const handler = require('./cron');


const app = express();
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => console.log(err));

app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

app.use('/api/cron', handler);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});