import path from 'path';
import fs from 'fs';
import os from 'os';
import { NextResponse, NextRequest } from 'next/server';
import { launchPuppeteer } from '@/lib/puppeteer-config';

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

export async function POST(req: NextRequest) {
  try {
    const { url, title } = await req.json();

    const browser = await launchPuppeteer();
    
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
    
    // Provide more specific error information
    if (error instanceof Error) {
      if (error.message.includes('browser at the configured path')) {
        console.error('Chromium executable not found. Check PUPPETEER_EXECUTABLE_PATH environment variable.');
        return NextResponse.json(
          { error: 'Browser executable not found in production environment' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
