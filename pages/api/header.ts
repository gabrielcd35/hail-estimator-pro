import { NextApiRequest, NextApiResponse } from 'next';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const config = {
  api: { bodyParser: { sizeLimit: '15mb' } },
};

// CCC ONE standard estimate layout (US Letter: 612 x 792 pts, y=0 at bottom-left)
// Header block at top of page 1 — 160pt covers shops that have large logos in their CCC header
const HEADER_HEIGHT_PT = 160;

// Inspection Location content area (middle column, below the label)
// y=395, height=140 → covers y=395–535 from bottom (32%–50% from top)
// Stops before the Vehicle VIN table (~55% from top) to avoid cutting that area
const INSP_X = 190;
const INSP_Y_FROM_BOTTOM = 395;
const INSP_W = 195;
const INSP_H = 140;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { pdfBase64, logoBase64, logoType, businessName, businessAddress, businessPhone } = req.body;
    if (!pdfBase64) return res.status(400).json({ error: 'No PDF provided' });
    if (!logoBase64) return res.status(400).json({ error: 'No logo provided' });

    const pdfDoc = await PDFDocument.load(Buffer.from(pdfBase64, 'base64'));
    const page = pdfDoc.getPage(0);
    const { width, height } = page.getSize();

    // Scale factors if PDF isn't exactly US Letter
    const sx = width / 612;
    const sy = height / 792;

    // 1. Cover original shop header with white rectangle
    const headerH = HEADER_HEIGHT_PT * sy;
    page.drawRectangle({ x: 0, y: height - headerH, width, height: headerH, color: rgb(1, 1, 1) });

    // 2. Embed and draw logo
    const logoBytes = Buffer.from(logoBase64, 'base64');
    const isPng = logoType === 'image/png' || logoType === 'png';
    const logoImage = isPng
      ? await pdfDoc.embedPng(logoBytes)
      : await pdfDoc.embedJpg(logoBytes);

    const { width: lw, height: lh } = logoImage.size();
    const hasBusinessText = businessName || businessAddress || businessPhone;

    // Max space for logo — more room when there's no business text below
    const maxLogoW = 420 * sx;
    const maxLogoH = (hasBusinessText ? 85 : 130) * sy;

    // Scale proportionally — allow upscaling so small logos fill the available space
    const logoScale = Math.min(maxLogoW / lw, maxLogoH / lh);
    const scaledW = lw * logoScale;
    const scaledH = lh * logoScale;

    const padTop = 8 * sy;
    page.drawImage(logoImage, {
      x: (width - scaledW) / 2,
      y: height - padTop - scaledH,
      width: scaledW,
      height: scaledH,
    });

    // 3. Draw business info centered below logo
    if (hasBusinessText) {
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontSize = 8;
      const lineH = 11 * sy;
      let ty = height - padTop - scaledH - 9 * sy;

      const drawCentered = (text: string, f: typeof font) => {
        const tw = f.widthOfTextAtSize(text, fontSize);
        page.drawText(text, { x: (width - tw) / 2, y: ty, size: fontSize, font: f, color: rgb(0, 0, 0) });
        ty -= lineH;
      };

      if (businessName) drawCentered(businessName, boldFont);
      if (businessAddress) drawCentered(businessAddress, font);
      if (businessPhone) drawCentered(businessPhone, font);
    }

    // 4. Cover Inspection Location content with white rectangle (leave blank)
    page.drawRectangle({
      x: INSP_X * sx,
      y: INSP_Y_FROM_BOTTOM * sy,
      width: INSP_W * sx,
      height: INSP_H * sy,
      color: rgb(1, 1, 1),
    });

    const modified = await pdfDoc.save();
    return res.status(200).json({ pdfBase64: Buffer.from(modified).toString('base64') });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
