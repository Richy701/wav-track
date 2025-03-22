import { chromium } from '@playwright/test';
import { join } from 'path';
import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

const FEATURES_DIR = join(process.cwd(), 'public', 'images', 'features');

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForServer(url: string, maxAttempts = 10): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return true;
      }
    } catch (error) {
      // Server not ready yet
    }
    await sleep(1000); // Wait 1 second between attempts
  }
  return false;
}

async function startDevServer() {
  return new Promise((resolve, reject) => {
    const devServer = spawn('npm', ['run', 'dev'], {
      stdio: 'pipe',
      shell: true
    });

    // Wait for the server to be ready
    devServer.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Local:') || output.includes('ready in')) {
        console.log('Development server is starting...');
        // Wait for the server to actually be ready
        waitForServer('http://localhost:5173')
          .then((ready) => {
            if (ready) {
              console.log('Development server is ready!');
              resolve(devServer);
            } else {
              reject(new Error('Server failed to become ready'));
            }
          })
          .catch(reject);
      }
    });

    devServer.stderr.on('data', (data) => {
      console.error(`Dev server error: ${data}`);
    });

    // Set a timeout
    setTimeout(() => {
      reject(new Error('Dev server failed to start within 30 seconds'));
    }, 30000);
  });
}

async function captureFeatureScreenshots() {
  let devServer;
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  try {
    // Start the development server
    console.log('Starting development server...');
    devServer = await startDevServer();

    // Wait a bit for the server to fully initialize
    await sleep(5000);

    // Navigate to the login page
    console.log('Navigating to login page...');
    await page.goto('http://localhost:5173/login');

    // Wait for the app to load
    await page.waitForLoadState('networkidle');

    // Wait for the login form to be visible
    await page.waitForSelector('form', { timeout: 5000 });

    // Login (adjust these selectors based on your actual login form)
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for login to complete and redirect
    await page.waitForLoadState('networkidle');
    await page.waitForURL('**/dashboard');

    // Capture Dashboard screenshot (Project Management)
    console.log('Capturing Project Management screenshot...');
    await page.screenshot({
      path: join(FEATURES_DIR, 'project-management.png'),
      fullPage: true,
    });

    // Create a new project
    console.log('Creating new project...');
    await page.click('button:has-text("New Project")');
    await page.waitForLoadState('networkidle');

    // Capture Beat Creation screenshot
    console.log('Capturing Beat Creation screenshot...');
    await page.screenshot({
      path: join(FEATURES_DIR, 'beat-creation.png'),
      fullPage: true,
    });

    // Navigate to project details and analysis
    console.log('Navigating to project analysis...');
    await page.click('a:has-text("Project Details")');
    await page.waitForLoadState('networkidle');

    // Capture Audio Analysis screenshot
    console.log('Capturing Audio Analysis screenshot...');
    await page.screenshot({
      path: join(FEATURES_DIR, 'audio-analysis.png'),
      fullPage: true,
    });

    // Navigate to collaboration view
    console.log('Navigating to collaboration view...');
    await page.click('a:has-text("Collaboration")');
    await page.waitForLoadState('networkidle');

    // Capture Collaboration screenshot
    console.log('Capturing Collaboration screenshot...');
    await page.screenshot({
      path: join(FEATURES_DIR, 'collaboration.png'),
      fullPage: true,
    });

    console.log('All screenshots captured successfully!');
  } catch (error) {
    console.error('Error capturing screenshots:', error);
  } finally {
    await browser.close();
    if (devServer) {
      devServer.kill();
    }
  }
}

// Run the script
captureFeatureScreenshots(); 