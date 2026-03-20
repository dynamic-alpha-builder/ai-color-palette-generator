const { chromium } = require('@playwright/test');

const BASE_URL = 'https://ai-color-palette-generator-ten.vercel.app';

async function debugTest() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture all network responses
  page.on('response', (response) => {
    console.log(`${response.status()} ${response.request().method()} ${response.url()}`);
  });

  // Capture all network requests
  page.on('request', (request) => {
    console.log(`-> ${request.method()} ${request.url()}`);
  });

  console.log('Navigating to:', BASE_URL);
  await page.goto(BASE_URL);

  // Wait a bit for everything to load
  await page.waitForLoadState('networkidle');

  console.log('\nPage loaded successfully');
  console.log('Title:', await page.title());

  // Test API endpoints
  console.log('\n=== Testing API Endpoints ===');

  // Test GET /api/palettes
  try {
    console.log('\nTesting GET /api/palettes...');
    const response = await page.request.get(`${BASE_URL}/api/palettes`);
    console.log(`Status: ${response.status()}`);
    console.log('Response:', await response.json());
  } catch (error) {
    console.error('Error:', error.message);
  }

  // Test POST /api/generate (if exists)
  try {
    console.log('\nTesting POST /api/generate...');
    const response = await page.request.post(`${BASE_URL}/api/generate`, {
      data: { prompt: 'sunset beach' }
    });
    console.log(`Status: ${response.status()}`);
    console.log('Response:', await response.json());
  } catch (error) {
    console.error('Error:', error.message);
  }

  // Check for localStorage
  console.log('\n=== Checking LocalStorage ===');
  const storage = await page.evaluate(() => window.localStorage);
  console.log('LocalStorage:', storage);

  // Check for any API errors in page
  console.log('\n=== Checking Page Network Activity ===');
  
  // Try to generate a palette and capture all network traffic
  console.log('\nFilling input field...');
  await page.locator('input[type="text"], textarea').first().fill('test prompt');
  
  console.log('Clicking generate button...');
  await page.locator('button:has-text("Generate")').first().click();

  // Wait and capture responses
  console.log('Waiting for responses...');
  await page.waitForTimeout(5000);

  await browser.close();
}

debugTest().catch(console.error);
