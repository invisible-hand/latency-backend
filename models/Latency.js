// backend/models/Latency.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LatencySchema = new Schema({
  provider: { type: String, required: true },
  model: { type: String, required: true },
  latency: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Latency', LatencySchema);