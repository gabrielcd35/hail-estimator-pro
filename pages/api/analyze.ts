import { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk';
import { BUSINESS_RULES_PROMPT } from '../../lib/rules';

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

const client = new Anthropic();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { fileData, fileType, fileName, mode } = req.body;
    if (!fileData) return res.status(400).json({ error: 'No file data provided' });

    const modeLabel = mode === 'invoice'
      ? 'This is a VENDOR INVOICE. Extract all line items and identify how to add each to CCC ONE (sublet, part, misc) and at what value.'
      : 'This is a CCC ONE ESTIMATE or SCOPE SHEET. Analyze it against my business rules and identify what is missing, incorrect, or needs to be added.';

    const mediaType = (fileType === 'pdf' ? 'application/pdf' : 'image/jpeg') as 'application/pdf' | 'image/jpeg';

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: BUSINESS_RULES_PROMPT,
      messages: [{
        role: 'user',
        content: [
          { type: 'document', source: { type: 'base64', media_type: mediaType, data: fileData } },
          { type: 'text', text: `${modeLabel}\n\nFile: ${fileName}` },
        ],
      }],
    });

    const textBlock = response.content.find(b => b.type === 'text');
    const analysis = textBlock && 'text' in textBlock ? textBlock.text : 'No analysis available';
    return res.status(200).json({ analysis, usage: response.usage });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
