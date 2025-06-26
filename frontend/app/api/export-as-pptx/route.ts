import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer';
import { NextResponse, NextRequest } from 'next/server';
import PptxGenJS from 'pptxgenjs';

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

export async function POST(req: NextRequest) {
  try {
    const { url, title } = await req.json();

    // Launch browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport to match slide dimensions (16:9 aspect ratio)
    await page.setViewport({ width: 1280, height: 720 });
    
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Wait a bit more to ensure everything is loaded
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Find all slide containers
    const slideElements = await page.$$('.slide-container');
    
    console.log(`Found ${slideElements.length} slides`);

    // Create PowerPoint presentation
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_16x9'; // 16:9 aspect ratio
    
    if (slideElements.length > 0) {
      // Capture each slide individually
      for (let i = 0; i < slideElements.length; i++) {
        console.log(`Processing slide ${i + 1}/${slideElements.length}`);
        
        const slide = pptx.addSlide();
        
        // Scroll to the slide element to ensure it's visible
        await slideElements[i].evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait for scroll to complete
        
        // Capture screenshot of the specific slide
        const screenshot = await slideElements[i].screenshot({
          type: 'png',
          omitBackground: false
        });
        
        // Convert screenshot to base64
        const base64Image = `data:image/png;base64,${Buffer.from(screenshot).toString('base64')}`;
        
        // Add image to slide (full slide size)
        slide.addImage({
          data: base64Image,
          x: 0,
          y: 0,
          w: '100%',
          h: '100%'
        });
      }
    } else {
      console.log('No slide containers found, capturing full page');
      
      // Fallback: capture full page as single slide
      const fullScreenshot = await page.screenshot({
        type: 'png',
        fullPage: false, // Don't capture full page, just visible area
        omitBackground: false
      });
      
      const slide = pptx.addSlide();
      const base64Image = `data:image/png;base64,${Buffer.from(fullScreenshot).toString('base64')}`;
      
      slide.addImage({
        data: base64Image,
        x: 0,
        y: 0,
        w: '100%',
        h: '100%'
      });
    }
    
    await browser.close();
    
    // Save PPTX file
    const sanitizedTitle = sanitizeFilename(title);
    const backendDataDirectory = '/Users/tejuss/Desktop/deck-genie-v3/backend/data';
    const destinationPath = path.join(backendDataDirectory, `${sanitizedTitle}.pptx`);
    
    // Ensure the directory exists
    await fs.promises.mkdir(path.dirname(destinationPath), { recursive: true });
    
    // Write PPTX file
    const pptxBuffer = await pptx.write({ outputType: 'nodebuffer' });
    await fs.promises.writeFile(destinationPath, Buffer.from(pptxBuffer as ArrayBuffer));

    // Return relative path for URL
    const relativePath = path.relative(backendDataDirectory, destinationPath);
    
    return NextResponse.json({
      success: true,
      path: destinationPath,
      url: `/static/${relativePath.replace(/\\/g, '/')}`
    });
  } catch (error) {
    console.error('PPTX generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate PPTX' },
      { status: 500 }
    );
  }
}
