import { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk';
import { BUSINESS_RULES_PROMPT } from '../../lib/rules';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

const client = new Anthropic();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileData, fileType, fileName, mode } = req.body;

    if (!fileData) {
      return res.status(400).json({ error: 'No file data provided' });
    }

    const modeLabel = mode === 'invoice'
      ? 'This is a VENDOR INVOICE or PARTS INVOICE. Extract all line items with descriptions and amounts. Then identify how each item should be added to a CCC ONE estimate (as sublet, part, misc, etc.) and at what value.'
      : 'This is a CCC ONE ESTIMATE or SCOPE SHEET. Analyze it against my business rules and identify what is missing, incorrect, or needs to be added.';

    const messages: Anthropic.MessageParam[] = [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: fileType === 'pdf' ? 'application/pdf' : 'image/jpeg',
              data: fileData,
            },
          } as Anthropic.DocumentBlockParam,
          {
            type: 'text',
            text: `${modeLabel}\n\nFile: ${fileName}`,
          },
        ],
      },
    ];

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: BUSINESS_RULES_PROMPT,
      messages,
    });

    const textContent = response.content.find(block => block.type === 'text');
    const analysisText = textContent ? (textContent as Anthropic.TextBlock).text : 'No analysis available';

    return res.status(200).json({
      analysis: analysisText,
      usage: response.usage,
    });
  } catch (error: unknown) {
    console.error('Analysis error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
