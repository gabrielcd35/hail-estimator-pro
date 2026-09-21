import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const webhookUrl = process.env.SCOPE_SHEET_WEBHOOK_URL;
  if (!webhookUrl) {
    return res.status(500).json({ error: 'Scope Sheet Google Sheet is not connected yet — ask Gabriel to finish the setup.' });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const text = await response.text();
    if (!response.ok) return res.status(502).json({ error: `Google Sheet rejected the save: ${text.slice(0, 300)}` });
    return res.status(200).json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
