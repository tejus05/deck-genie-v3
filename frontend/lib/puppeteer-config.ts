import puppeteer from 'puppeteer';
import { execSync } from 'child_process';
import fs from 'fs';

export interface PuppeteerLaunchOptions {
  headless: boolean;
  args: string[];
  executablePath?: string;
}

/**
 * Find chromium executable in common locations
 */
function findChromiumExecutable(): string | null {
  const possiblePaths = [
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/snap/bin/chromium',
    '/opt/google/chrome/chrome'
  ];

  // First try the environment variable
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    if (fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
      return process.env.PUPPETEER_EXECUTABLE_PATH;
    }
  }

  // Try to find chromium using 'which'
  try {
    const whichResult = execSync('which chromium', { encoding: 'utf8' }).trim();
    if (whichResult && fs.existsSync(whichResult)) {
      return whichResult;
    }
  } catch (error) {
    // which command failed, continue with manual search
  }

  // Try common paths
  for (const path of possiblePaths) {
    if (fs.existsSync(path)) {
      return path;
    }
  }

  return null;
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

  // Find chromium executable
  const chromiumPath = findChromiumExecutable();
  if (chromiumPath) {
    config.executablePath = chromiumPath;
    console.log(`Using Chromium at: ${chromiumPath}`);
  } else {
    console.log('No chromium executable found, will try default puppeteer behavior');
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
    console.log('=== Environment Debug ===');
    console.log('PUPPETEER_EXECUTABLE_PATH:', process.env.PUPPETEER_EXECUTABLE_PATH);
    console.log('PUPPETEER_SKIP_CHROMIUM_DOWNLOAD:', process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD);
    
    // Check if the configured path exists
    if (config.executablePath) {
      try {
        const fs = require('fs');
        const exists = fs.existsSync(config.executablePath);
        console.log(`Chromium path exists (${config.executablePath}): ${exists}`);
        if (exists) {
          const stats = fs.statSync(config.executablePath);
          console.log(`Chromium is executable: ${(stats.mode & parseInt('111', 8)) !== 0}`);
        }
      } catch (fsError) {
        console.error('Error checking chromium path:', fsError);
      }
    }
    
    const browser = await puppeteer.launch(config);
    console.log('Puppeteer launched successfully');
    return browser;
  } catch (error) {
    console.error('Failed to launch Puppeteer:', error);
    
    // Try to find available browsers
    console.log('=== Available Browser Search ===');
    try {
      const { execSync } = require('child_process');
      console.log('Searching for browsers...');
      
      const commands = [
        'find /usr -name "*chrom*" -type f 2>/dev/null | head -10',
        'ls -la /usr/bin/*chrom* 2>/dev/null',
        'which chromium chromium-browser google-chrome google-chrome-stable 2>/dev/null',
        'dpkg -l | grep -i chrom'
      ];
      
      for (const cmd of commands) {
        try {
          const result = execSync(cmd, { encoding: 'utf8', timeout: 5000 });
          console.log(`Command: ${cmd}`);
          console.log(`Result: ${result}`);
        } catch (cmdError) {
          console.log(`Command failed: ${cmd}`);
        }
      }
    } catch (searchError) {
      console.error('Error during browser search:', searchError);
    }
    
    if (error instanceof Error && error.message.includes('Browser was not found at the configured executablePath')) {
      const chromiumPath = findChromiumExecutable();
      throw new Error(`Browser executable not found at: ${chromiumPath || 'unknown path'}. Check the build logs for chromium installation.`);
    }
    
    throw error;
  }
}
