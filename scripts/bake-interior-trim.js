// One-off script: permanently prints "R&I INTERIOR TRIM     R&R" into the
// door boxes of scope-sheet-template.pdf, using the blank gap that already
// sits below each door's checklist (between the last printed line and the
// U.P.D./OVERSIZE row) — the dent-count space at the top of each box is
// untouched. Run with: node scripts/bake-interior-trim.js
const fs = require('fs');
const path = require('path');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

async function main() {
  const templatePath = path.join(__dirname, '..', 'public', 'scope-sheet-template.pdf');
  const bytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(bytes);
  const page = pdfDoc.getPages()[0];
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const black = rgb(0, 0, 0);
  const size = 7.5;

  // x = left column (LF/LR DOOR) start; RT column (RF/RR DOOR) mirrors +413
  const lines = [
    { x: 29, y: 318 },  // LF DOOR — gap between Mirror Glass and U.P.D./OVERSIZE
    { x: 442, y: 318 }, // RF DOOR
    { x: 29, y: 175 },  // LR DOOR — gap between Bodyside Mldg and U.P.D./OVERSIZE
    { x: 442, y: 175 }, // RR DOOR
  ];

  for (const { x, y } of lines) {
    page.drawText('R&I', { x, y, size, font, color: black });
    page.drawText('INTERIOR TRIM', { x: x + 17, y, size, font, color: black });
    page.drawText('R&R', { x: x + 77, y, size, font, color: black });
  }

  const outBytes = await pdfDoc.save();
  fs.writeFileSync(templatePath, outBytes);
  console.log('Baked R&I Interior Trim into', templatePath);
}

main().catch(e => { console.error(e); process.exit(1); });
