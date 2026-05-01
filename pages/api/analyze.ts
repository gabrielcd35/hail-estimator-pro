import { NextApiRequest, NextApiResponse } from 'next';
import { BUSINESS_RULES_PROMPT } from '../../lib/rules';

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
  maxDuration: 60,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { fileData, fileType, fileName, mode } = req.body;
    if (!fileData) return res.status(400).json({ error: 'No file data provided' });
    const modeLabel = mode === 'invoice'
      ? 'This is a VENDOR INVOICE. Extract all line items and identify how to add each to CCC ONE and at what value.'
      : 'This is a CCC ONE ESTIMATE or SCOPE SHEET. Analyze it against my business rules and identify what is missing, incorrect, or needs to be added.';
    const mediaType = fileType === 'pdf' ? 'application/pdf' : 'image/jpeg';
    const payload = {
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system: BUSINESS_RULES_PROMPT,
      messages: [{ role: 'user', content: [
        { type: 'document', source: { type: 'base64', media_type: mediaType, data: fileData } },
        { type: 'text', text: modeLabel + ' File: ' + fileName },
      ]}],
    };
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: JSON.stringify(data.error || data) });
    const textBlock = data.content?.find((b) => b.type === 'text');
    const analysis = textBlock?.text || 'No analysis available';
    return res.status(200).json({ analysis, usage: data.usage });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
