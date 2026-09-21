import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const webhookUrl = process.env.SCOPE_SHEET_WEBHOOK_URL;
  if (!webhookUrl) {
    return res.status(500).json({ error: 'Scope Sheet Google Sheet is not connected yet — ask Gabriel to finish the setup.' });
  }

  try {
    const response = await fetch(webhookUrl, { method: 'GET' });
    const data = await response.json();
    if (!response.ok) return res.status(502).json({ error: 'Google Sheet rejected the request.' });
    return res.status(200).json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
