import path from 'path';
import fs from 'fs';
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
    const backendDataDirectory = '/Users/tejuss/Desktop/deck-genie-v3/backend/data';
    const destinationPath = path.join(backendDataDirectory, `${sanitizedTitle}.pdf`);
    
    // Ensure the directory exists
    await fs.promises.mkdir(path.dirname(destinationPath), { recursive: true });
    await fs.promises.writeFile(destinationPath, pdfBuffer);

    // Return relative path for URL
    const relativePath = path.relative(backendDataDirectory, destinationPath);
    
    return NextResponse.json({
      success: true,
      path: destinationPath,
      url: `/static/${relativePath.replace(/\\/g, '/')}`
    });
  } catch (error) {
    console.error('PDF generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
