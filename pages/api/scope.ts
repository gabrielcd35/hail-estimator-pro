import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
  maxDuration: 60,
};

const SCOPE_PROMPT = `You are reading a PDR (Paintless Dent Repair) scope sheet / vehicle assessment sheet. It may be a handwritten PDR Linx form, a Progressive scope sheet, another carrier's form, or a typed/digital document. Extract ALL information into JSON.

Each panel section on the form is assigned ONE repair mode — determine it like this:
- "pdr": the panel has a dent count written on it (e.g. "1 NKL", "92-Q", "51" under a size). This is the default when only a dent count/size is present. Most panels are this.
- "repair": the panel is explicitly marked/labeled for conventional repair (bodywork + paint), not a full panel replacement. Look for words like "REPAIR", "BLEND", or explicit paint-hours notation instead of / alongside a dent count.
- "rr": the panel itself (not just a trim part on it) is marked to be fully replaced — e.g. the panel name itself circled/marked "R&R", or a handwritten note saying the panel is being replaced.
If you cannot tell, default to "pdr" when a dent count is present, otherwise null.

Notation guide (varies by form):
- Dent counts may be written as "COUNT - SIZE" per panel, e.g. "92-Q" = 92 dents, Quarter size. Sizes: D=dime, N=nickel, Q=quarter, H=half dollar. Other forms may use separate count and size columns, or size words (dime/nickel/quarter/half).
- "OVERSIZE:" or "O/S" followed by a number = count of oversize dents on that panel.
- IMPORTANT — part replacements: each panel section lists small part names (moldings, trim, lamps, mirrors, handles, etc.) each with an "R&I" / "R&R" option printed next to it. When a part name or its "R&R" option is CIRCLED, underlined, or otherwise marked by hand, that specific PART must be replaced — put the part name (e.g. "Upper Molding", "Belt Molding", "Mirror Assy") in that panel's "replacements" array. This is independent of the panel's own repairType — a PDR panel can still have a molding marked for replacement. Handwritten part names not printed on the form, or typed/digital annotations saying to replace something, also go in "replacements".
- Handwritten instructions that are NOT standard printed/circled items (extra handwritten notes, special instructions) go in the panel's "notes" field.
- "paintHours" — only for repair-mode panels: if the form writes a number of paint/refinish hours for that panel, capture it; otherwise null.
- UPD = up-charge for double panel/deep dents.
- Panel names vary by form (e.g. "Left Fender" = LT FENDER, "Roof Panel" = ROOF, "Deck Lid"/"Trunk" = DECK LID, "L Frt Door" = LF DOOR). Normalize them to the sheetLabel list below.

Return ONLY valid JSON (no markdown fences) with this exact shape:
{
  "vehicle": { "year": "", "make": "", "model": "", "color": "", "vin": "", "plate": "", "plateState": "", "claim": "", "carrier": "", "member": "", "phone": "" },
  "panels": [
    { "sheetLabel": "HOOD", "repairType": "pdr", "dentCount": 92, "dentSize": "Q", "oversize": 20, "paintHours": null, "replacements": [], "notes": "" }
  ]
}

Rules:
- Include a panel in "panels" ONLY if it has a dent count, oversize count, a repair/replace marking, a part replacement, or any handwritten marking.
- sheetLabel must be one of: LT FENDER, RT FENDER, HOOD, WINDSHIELD, LF DOOR, RF DOOR, LR DOOR, RR DOOR, L RAIL, R RAIL, ROOF, LT CAB, RT CAB, LT QUARTER, RT QUARTER, DECK LID, LT BED, RT BED, TAILGATE, FRONT BUMPER, REAR BUMPER.
- repairType is one of "pdr", "repair", "rr", or null.
- dentSize is the letter only (D, N, Q, H) or null if unreadable.
- replacements is always an array (empty array if none), listing only part names, not the panel itself.
- If a value is unreadable or absent use null (numbers), "" (strings), or [] (arrays).
- Read the VIN carefully character by character — it is 17 characters, no letters I, O, or Q.`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { imageData, mediaType } = req.body;
    if (!imageData) return res.status(400).json({ error: 'No image provided' });

    const isPdf = mediaType === 'application/pdf';
    const fileBlock = isPdf
      ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: imageData } }
      : { type: 'image', source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: imageData } };

    const payload = {
      model: 'claude-sonnet-5',
      max_tokens: 3000,
      messages: [{ role: 'user', content: [
        fileBlock,
        { type: 'text', text: SCOPE_PROMPT },
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

    const text = data.content?.find((b: { type: string }) => b.type === 'text')?.text || '';
    // Strip possible markdown fences before parsing
    const jsonStr = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      return res.status(500).json({ error: 'Could not parse scope sheet — try a clearer photo', raw: text });
    }

    return res.status(200).json({ scope: parsed, usage: data.usage });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
