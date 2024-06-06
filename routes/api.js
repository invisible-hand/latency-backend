const express = require('express');
const Latency = require('../models/Latency');
const router = express.Router();
const cronHandler = require('../cron'); // Importing cron handler from one folder above


// GET handler to fetch recent latencies for OpenAI (for debugging or display)
router.get('/openai-latency', async (req, res) => {
  try {
    const latencies = await Latency.find({ provider: 'openai' }).sort({ createdAt: -1 }).limit(60);
    res.status(200).json(latencies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET handler to fetch recent latencies for Anthropic (for debugging or display)
router.get('/anthropic-latency', async (req, res) => {
  try {
    const latencies = await Latency.find({ provider: 'anthropic' }).sort({ createdAt: -1 }).limit(60);
    res.status(200).json(latencies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Handler to fetch all historical latencies
router.get('/historical-latencies', async (req, res) => {
  try {
    const latencies = await Latency.find().sort({ createdAt: 1 });
    res.json(latencies);
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

router.get('/cron', cronHandler);



module.exports = router;