require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const apiRoutes = require('./routes/api');
const { recordLatency } = require('./latencyService');

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Schedule tasks to be run on the server every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log('Running a task every five minutes');
  const currentTime = new Date();
  const roundedTime = new Date(Math.floor(currentTime.getTime() / 300000) * 300000);
  try {
    // OpenAI models
    await recordLatency('openai', 'gpt-3.5-turbo', roundedTime);
    await recordLatency('openai', 'gpt-4', roundedTime);
    await recordLatency('openai', 'gpt-4-turbo', roundedTime);
    await recordLatency('openai', 'gpt-4o', roundedTime);

    // Anthropic models
    await recordLatency('anthropic', 'claude-3-opus-20240229', roundedTime);
    await recordLatency('anthropic', 'claude-3-sonnet-20240229', roundedTime);
    await recordLatency('anthropic', 'claude-3-haiku-20240307', roundedTime);

    await recordLatency('google', 'gemini-1.5-pro', roundedTime);
    await recordLatency('google', 'gemini-1.5-flash', roundedTime);
    await recordLatency('google', 'gemini-1.0-pro', roundedTime);
  } catch (err) {
    console.error('Error recording latency directly:', err);
  }
});