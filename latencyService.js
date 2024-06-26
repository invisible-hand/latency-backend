// backend/latencyService.js
const axios = require('axios');
const Latency = require('./models/Latency');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk").default;


async function recordLatency(provider, model, timestamp) {
  try {
    let latency;
    let maxLatency;

    const measureLatency = async () => {
      if (provider === 'openai') {
        const openaiModels = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o'];
        if (!openaiModels.includes(model)) {
          throw new Error(`Invalid OpenAI model: ${model}`);
        }
        maxLatency = 10000;
        const startTime = Date.now();
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: model,
          messages: [{ role: 'user', content: 'Tell me a joke' }],
          max_tokens: 50,
          temperature: 0.7
        }, {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          }
        });
        return Date.now() - startTime;
      } else if (provider === 'anthropic') {
        const anthropicModels = ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307', 'claude-3-5-sonnet-20240620'];


        if (!anthropicModels.includes(model)) {
          throw new Error(`Invalid Anthropic model: ${model}`);
        }
        maxLatency = 10000;
        const startTime = Date.now();
        const response = await axios.post('https://api.anthropic.com/v1/messages', {
          messages: [{ role: 'user', content: 'Tell me a joke' }],
          model: model,
          max_tokens: 100,
          temperature: 0.7
        }, {
          headers: {
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          }
        });
        const endTime = Date.now();
        console.log(`Received response for Anthropic model ${model}. Status: ${response.status}`); // Add this log
        console.log(`Response data for ${model}:`, JSON.stringify(response.data, null, 2)); // Add this log (be careful with sensitive data)
        return endTime - startTime;
        
      } else if (provider === 'google') {
        const geminiModels = ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'];
        if (!geminiModels.includes(model)) {
          throw new Error(`Invalid Google Gemini model: ${model}`);
        }
        maxLatency = 10000;
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
        const geminiModel = genAI.getGenerativeModel({ model: model });
        const startTime = Date.now();
        const result = await geminiModel.generateContent('Tell me a joke');
        const response = await result.response;
        await response.text();
        return Date.now() - startTime;
      } else if (provider === 'groq') {
        const groqModels = ['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768'];
        if (!groqModels.includes(model)) {
          throw new Error(`Invalid Groq model: ${model}`);
        }
        maxLatency = 3000;
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const startTime = Date.now();
        const response = await groq.chat.completions.create({
          messages: [{ role: 'user', content: 'Tell me a joke' }],
          model: model,
          max_tokens: 100,
        });
        return Date.now() - startTime;
      } else {
        throw new Error(`Invalid provider: ${provider}`);
      }
    };

    latency = await measureLatency();

    if (latency > maxLatency) {
      console.log(`${provider} - ${model} latency exceeded ${maxLatency / 1000} seconds. Skipping measurement.`);
      return;
    }

    const newLatency = new Latency({
      provider,
      model,
      latency,
      createdAt: timestamp
    });
    await newLatency.save();

    console.log(`${provider} - ${model} latency recorded: ${latency} ms`);
  } catch (error) {
    console.error(`Error recording ${provider} - ${model} latency:`, error);
    if (error.response) {
      console.error(`Response status: ${error.response.status}`);
      console.error(`Response data:`, error.response.data);
    }
  }
}

module.exports = { recordLatency };