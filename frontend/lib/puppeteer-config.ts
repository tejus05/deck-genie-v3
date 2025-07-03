import puppeteer from 'puppeteer';

export interface PuppeteerLaunchOptions {
  headless: boolean;
  args: string[];
  executablePath?: string;
}

/**
 * Get Puppeteer configuration for both development and production environments
 */
export function getPuppeteerConfig(): PuppeteerLaunchOptions {
  const config: PuppeteerLaunchOptions = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-extensions',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding'
    ]
  };

  // Use environment variables for production
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    config.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    console.log(`Using Chromium at: ${process.env.PUPPETEER_EXECUTABLE_PATH}`);
  }

  return config;
}

/**
 * Launch Puppeteer with proper error handling
 */
export async function launchPuppeteer() {
  try {
    const config = getPuppeteerConfig();
    console.log('Launching Puppeteer with config:', JSON.stringify(config, null, 2));
    
    // Additional debug information
    console.log('Environment check:');
    console.log('PUPPETEER_EXECUTABLE_PATH:', process.env.PUPPETEER_EXECUTABLE_PATH);
    console.log('PUPPETEER_SKIP_CHROMIUM_DOWNLOAD:', process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD);
    
    const browser = await puppeteer.launch(config);
    console.log('Puppeteer launched successfully');
    return browser;
  } catch (error) {
    console.error('Failed to launch Puppeteer:', error);
    
    // Additional debugging
    console.log('=== Debug Information ===');
    console.log('Process environment variables:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('PUPPETEER_EXECUTABLE_PATH:', process.env.PUPPETEER_EXECUTABLE_PATH);
    console.log('PUPPETEER_SKIP_CHROMIUM_DOWNLOAD:', process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD);
    
    if (error instanceof Error && error.message.includes('browser at the configured path')) {
      throw new Error(`Browser executable not found. Configured path: ${process.env.PUPPETEER_EXECUTABLE_PATH}. Please check if chromium is installed at the specified path.`);
    }
    
    throw error;
  }
}
