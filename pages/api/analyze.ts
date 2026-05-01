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
      : 'This is a CCC ONE ESTIMATE or SCOPE SHEET. Analyze it against my business rules.';


    const mediaType = fileType === 'pdf' ? 'application/pdf' : 'image/jpeg';


    const payload = {
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system: BUSINESS_RULES_PROMPT,
      messages: [{
        role: 'user',
        content: [
          { type: 'document', source: { type: 'base64', media_type: mediaType, data: fileData } },
          { type: 'text', text: modeLabel + ' File: ' + fileName },
        ],
      }],
    };


    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
