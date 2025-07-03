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
    // If it's just 'chromium', let puppeteer find it in PATH
    if (process.env.PUPPETEER_EXECUTABLE_PATH === 'chromium') {
      // Don't set executablePath, let Puppeteer find it
      console.log('Using Chromium from PATH');
    } else {
      config.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
      console.log(`Using Chromium at: ${process.env.PUPPETEER_EXECUTABLE_PATH}`);
    }
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
    const browser = await puppeteer.launch(config);
    return browser;
  } catch (error) {
    console.error('Failed to launch Puppeteer:', error);
    
    if (error instanceof Error && error.message.includes('browser at the configured path')) {
      throw new Error('Browser executable not found in production environment. Please check PUPPETEER_EXECUTABLE_PATH.');
    }
    
    throw error;
  }
}
