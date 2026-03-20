const { chromium } = require('@playwright/test');

const BASE_URL = 'https://ai-color-palette-generator-ten.vercel.app';

async function detailedApiTest() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Intercept and log all request/response details
  page.on('response', async (response) => {
    if (response.request().method() === 'POST') {
      console.log(`\nResponse to POST ${response.url()}`);
      console.log(`Status: ${response.status()}`);
      try {
        const text = await response.text();
        console.log('Body:', text);
      } catch (e) {
        console.log('Could not read body');
      }
    }
  });

  console.log('Navigating to:', BASE_URL);
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');

  console.log('Page loaded');

  // Test with different payloads
  const testCases = [
    { prompt: 'sunset beach' },
    { prompt: 'test' },
    { prompt: '' },
  ];

  for (const testCase of testCases) {
    console.log(`\n=== Testing with prompt: "${testCase.prompt}" ===`);
    try {
      const response = await page.request.post(`${BASE_URL}/api/generate`, {
        data: testCase
      });
      console.log(`Status: ${response.status()}`);
      const data = await response.json();
      console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error:', error.message);
    }
  }

  await browser.close();
}

detailedApiTest().catch(console.error);
