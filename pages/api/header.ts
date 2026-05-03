import { NextApiRequest, NextApiResponse } from 'next';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const config = {
  api: { bodyParser: { sizeLimit: '15mb' } },
};

// All coordinates are in a clean US Letter space (612 x 792 pts, y=0 at bottom-left).
// We embed the original page as a Form XObject drawn FIRST, then draw our modifications
// on top — this guarantees correct rendering order regardless of the source PDF structure.

const PAGE_W = 612;
const PAGE_H = 792;

// Top 160pt covers even shops that have large logos in their CCC header (~2.2 inches)
const HEADER_H = 160;

// Inspection Location content area (middle column, below the "Inspection Location:" label)
// Covers roughly 33%–54% from top of page
const INSP_X = 190;
const INSP_Y = 360;   // from bottom
const INSP_W = 195;
const INSP_H = 175;   // tall enough to catch all 6 address lines

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { pdfBase64, logoBase64, logoType, businessName, businessAddress, businessPhone } = req.body;
    if (!pdfBase64) return res.status(400).json({ error: 'No PDF provided' });
    if (!logoBase64) return res.status(400).json({ error: 'No logo provided' });

    const origBytes = Buffer.from(pdfBase64, 'base64');

    // Load original to get page count and first-page dimensions
    const origPdf = await PDFDocument.load(origBytes);
    const pageCount = origPdf.getPageCount();
    const { width: origW, height: origH } = origPdf.getPage(0).getSize();

    // Build the output PDF
    const outPdf = await PDFDocument.create();

    // ── Page 1: embed original as Form XObject, draw on fresh US Letter page ──
    // Embedding from raw bytes guarantees the XObject contains the full original content.
    // drawPage() renders it FIRST in the new page's content stream; everything we draw
    // afterward is appended to the same stream, so it renders ON TOP.
    const [embeddedPage] = await outPdf.embedPdf(origBytes, [0]);

    const p1 = outPdf.addPage([PAGE_W, PAGE_H]);
    p1.drawPage(embeddedPage, {
      x: 0,
      y: 0,
      xScale: PAGE_W / origW,
      yScale: PAGE_H / origH,
    });

    // 1. White rectangle over the original shop header
    p1.drawRectangle({ x: 0, y: PAGE_H - HEADER_H, width: PAGE_W, height: HEADER_H, color: rgb(1, 1, 1) });

    // 2. Embed and place logo
    const logoBytes = Buffer.from(logoBase64, 'base64');
    const isPng = logoType === 'image/png' || logoType === 'png';
    const logoImage = isPng
      ? await outPdf.embedPng(logoBytes)
      : await outPdf.embedJpg(logoBytes);

    const { width: lw, height: lh } = logoImage.size();
    const hasText = businessName || businessAddress || businessPhone;
    const maxLogoW = 420;
    const maxLogoH = hasText ? 85 : 130;
    const logoScale = Math.min(maxLogoW / lw, maxLogoH / lh);
    const scaledW = lw * logoScale;
    const scaledH = lh * logoScale;

    const padTop = 8;
    p1.drawImage(logoImage, {
      x: (PAGE_W - scaledW) / 2,
      y: PAGE_H - padTop - scaledH,
      width: scaledW,
      height: scaledH,
    });

    // 3. Business info centered below logo
    if (hasText) {
      const font = await outPdf.embedFont(StandardFonts.Helvetica);
      const boldFont = await outPdf.embedFont(StandardFonts.HelveticaBold);
      const fontSize = 8;
      const lineH = 11;
      let ty = PAGE_H - padTop - scaledH - 10;

      const drawCentered = (text: string, f: typeof font) => {
        const tw = f.widthOfTextAtSize(text, fontSize);
        p1.drawText(text, { x: (PAGE_W - tw) / 2, y: ty, size: fontSize, font: f, color: rgb(0, 0, 0) });
        ty -= lineH;
      };

      if (businessName) drawCentered(businessName, boldFont);
      if (businessAddress) drawCentered(businessAddress, font);
      if (businessPhone) drawCentered(businessPhone, font);
    }

    // 4. White rectangle over Inspection Location content (leave blank)
    p1.drawRectangle({ x: INSP_X, y: INSP_Y, width: INSP_W, height: INSP_H, color: rgb(1, 1, 1) });

    // ── Remaining pages: copy unchanged ──
    if (pageCount > 1) {
      const indices = Array.from({ length: pageCount - 1 }, (_, i) => i + 1);
      const copied = await outPdf.copyPages(origPdf, indices);
      copied.forEach(pg => outPdf.addPage(pg));
    }

    const modified = await outPdf.save();
    return res.status(200).json({ pdfBase64: Buffer.from(modified).toString('base64') });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
