import { recordLatency } from '../../latencyService';

export default async function handler(req, res) {
  // Check if the request is authorized
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end('Unauthorized');
  }

  try {
    const currentTime = new Date();
    const roundedTime = new Date(Math.floor(currentTime.getTime() / 600000) * 600000);

    // OpenAI models
    await recordLatency('openai', 'gpt-3.5-turbo', roundedTime);
    await recordLatency('openai', 'gpt-4', roundedTime);
    await recordLatency('openai', 'gpt-4-turbo', roundedTime);
    await recordLatency('openai', 'gpt-4o', roundedTime);

    // Anthropic models
    await recordLatency('anthropic', 'claude-3-opus-20240229', roundedTime);
    await recordLatency('anthropic', 'claude-3-sonnet-20240229', roundedTime);
    await recordLatency('anthropic', 'claude-3-haiku-20240307', roundedTime);

    // Google Gemini models
    await recordLatency('google', 'gemini-1.5-pro', roundedTime);
    await recordLatency('google', 'gemini-1.5-flash', roundedTime);
    await recordLatency('google', 'gemini-1.0-pro', roundedTime);

    res.status(200).end('Cron job executed successfully');
  } catch (error) {
    console.error('Error executing cron job:', error);
    res.status(500).end('Error executing cron job');
  }
}