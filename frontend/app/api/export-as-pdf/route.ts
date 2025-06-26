import path from 'path';
import fs from 'fs';
import os from 'os';
import puppeteer from 'puppeteer';
import { NextResponse, NextRequest } from 'next/server';

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

export async function POST(req: NextRequest) {
  try {
    const { url, title } = await req.json();

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      printBackground: true,
      width: "1280px",
      height: "720px",
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });
    
    await browser.close();
    
    const sanitizedTitle = sanitizeFilename(title);
    // Use temp directory for PDF storage since presentations are now in temp
    const tempDir = os.tmpdir();
    const pdfStorageDir = path.join(tempDir, 'deck_genie_presentations', 'pdfs');
    
    // Ensure the directory exists
    await fs.promises.mkdir(pdfStorageDir, { recursive: true });
    
    const destinationPath = path.join(pdfStorageDir, `${sanitizedTitle}.pdf`);
    await fs.promises.writeFile(destinationPath, pdfBuffer);

    // Return the filename for download via the backend
    const filename = `${sanitizedTitle}.pdf`;
    
    return NextResponse.json({
      success: true,
      path: destinationPath,
      filename: filename,
      url: `/presentations/pdfs/${filename}`
    });
  } catch (error) {
    console.error('PDF generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
