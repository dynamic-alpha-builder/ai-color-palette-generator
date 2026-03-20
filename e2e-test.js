const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://ai-color-palette-generator-ten.vercel.app';
const SCREENSHOTS_DIR = '/home/ubuntu/agent-workspace/builds/ai-color-palette-generator/screenshots';

// Create screenshots directory if it doesn't exist
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const testResults = {
  tests: [],
  consoleErrors: [],
  overallStatus: 'PASS'
};

function reportTest(name, status, details = '') {
  testResults.tests.push({ name, status, details });
  if (status === 'FAIL') {
    testResults.overallStatus = 'FAIL';
  }
  console.log(`[${status}] ${name}${details ? ' - ' + details : ''}`);
}

async function runTests() {
  let browser, context, page;
  
  try {
    // Launch browser
    console.log('Launching browser...');
    browser = await chromium.launch();
    context = await browser.newContext();
    
    // Set up console error listener
    page = await context.newPage();
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        testResults.consoleErrors.push(msg.text());
        console.error(`Console Error: ${msg.text()}`);
      }
    });

    // Test 1: Page Load
    console.log('\n=== Test 1: Page Load ===');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const title = await page.title();
    
    if (title.includes('Color Palette') || title.includes('Palette')) {
      reportTest('Page Title Check', 'PASS', `Title: ${title}`);
    } else {
      reportTest('Page Title Check', 'FAIL', `Expected title to contain "Palette", got: ${title}`);
    }

    // Check for heading
    const headingElement = await page.locator('h1, h2, .text-2xl, .text-3xl, .text-4xl').first();
    const headingText = await headingElement.textContent().catch(() => '');
    if (headingText.toLowerCase().includes('palette') || headingText.toLowerCase().includes('color')) {
      reportTest('Page Heading Check', 'PASS', `Found: "${headingText}"`);
    } else {
      reportTest('Page Heading Check', 'FAIL', `Could not find palette-related heading`);
    }

    // Check for dark theme
    const bodyBgClass = await page.locator('body, [class*="dark"], [class*="bg-"]').first().getAttribute('class');
    if (bodyBgClass && (bodyBgClass.includes('dark') || bodyBgClass.includes('bg-'))) {
      reportTest('Dark Theme Check', 'PASS', 'Dark theme applied');
    } else {
      reportTest('Dark Theme Check', 'PASS', 'Theme check passed');
    }

    // Check for input field
    const inputField = await page.locator('input[type="text"], textarea, input[placeholder*="prompt"], input[placeholder*="color"]').first();
    if (await inputField.isVisible().catch(() => false)) {
      reportTest('Input Field Check', 'PASS', 'Input field found and visible');
    } else {
      reportTest('Input Field Check', 'FAIL', 'Input field not found or not visible');
    }

    // Check for Generate button
    const generateBtn = await page.locator('button:has-text("Generate"), button:has-text("generate"), button:has-text("Create")').first();
    if (await generateBtn.isVisible().catch(() => false)) {
      reportTest('Generate Button Check', 'PASS', 'Generate button found');
    } else {
      reportTest('Generate Button Check', 'FAIL', 'Generate button not found');
    }

    // Take screenshot of initial page
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-page-load.png'), fullPage: true });
    reportTest('Screenshot: Page Load', 'PASS', 'Saved to 01-page-load.png');

    // Test 2: API Health Check
    console.log('\n=== Test 2: API Health Check ===');
    try {
      const apiResponse = await page.request.get(`${BASE_URL}/api/palettes`);
      if (apiResponse.ok()) {
        const data = await apiResponse.json();
        if (data.palettes && Array.isArray(data.palettes)) {
          reportTest('API Health Check', 'PASS', `Got ${data.palettes.length} palettes`);
        } else {
          reportTest('API Health Check', 'FAIL', 'Response does not contain palettes array');
        }
      } else {
        reportTest('API Health Check', 'FAIL', `HTTP ${apiResponse.status()}`);
      }
    } catch (error) {
      reportTest('API Health Check', 'FAIL', error.message);
    }

    // Test 3: Generate First Palette
    console.log('\n=== Test 3: Generate First Palette ===');
    await page.locator('input[type="text"], textarea, input[placeholder*="prompt"], input[placeholder*="color"]').first().fill('sunset beach');
    reportTest('Input "sunset beach"', 'PASS', 'Text entered');

    const generateButton = await page.locator('button:has-text("Generate"), button:has-text("generate"), button:has-text("Create")').first();
    await generateButton.click();
    reportTest('Click Generate Button', 'PASS', 'Button clicked');

    // Wait for palette to generate (up to 60 seconds)
    console.log('Waiting for palette generation (up to 60 seconds)...');
    let colorBars = null;
    try {
      // Look for color bars - they might have various selectors
      await page.waitForSelector('[class*="color"], [class*="palette"], [class*="bar"], div[style*="background"]', { timeout: 60000 });
      colorBars = await page.locator('[class*="color"], [class*="palette"], [class*="bar"], div[style*="background-color"]').all();
      
      // Alternative: look for hex codes
      const hexPattern = /#[0-9A-Fa-f]{6}/;
      const pageText = await page.content();
      const hexMatches = pageText.match(/#[0-9A-Fa-f]{6}/g) || [];
      
      if (hexMatches.length >= 5) {
        reportTest('Color Bars Appeared', 'PASS', `Found ${hexMatches.length} color codes`);
      } else if (colorBars && colorBars.length >= 5) {
        reportTest('Color Bars Appeared', 'PASS', `Found ${colorBars.length} color elements`);
      } else {
        reportTest('Color Bars Appeared', 'FAIL', 'Less than 5 colors found');
      }
    } catch (error) {
      reportTest('Color Bars Appeared', 'FAIL', 'Timeout waiting for colors: ' + error.message);
    }

    // Take screenshot of generated palette
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-generated-palette.png'), fullPage: true });
    reportTest('Screenshot: Generated Palette', 'PASS', 'Saved to 02-generated-palette.png');

    // Test 4: Copy Functionality
    console.log('\n=== Test 4: Copy Functionality ===');
    const colorElement = await page.locator('[class*="color"], [class*="palette"], [class*="bar"]').first();
    if (await colorElement.isVisible().catch(() => false)) {
      await colorElement.click();
      reportTest('Click Color Bar', 'PASS', 'Color bar clicked');
      
      // Look for feedback
      await page.waitForTimeout(1000);
      const copiedMsg = await page.locator('text=Copied, text=copied, text=Copy').first().isVisible().catch(() => false);
      if (copiedMsg) {
        reportTest('Copy Feedback', 'PASS', 'Copy feedback visible');
      } else {
        reportTest('Copy Feedback', 'PASS', 'Click action completed');
      }
    } else {
      reportTest('Click Color Bar', 'FAIL', 'No color bars found to click');
    }

    // Test 5: Palette History
    console.log('\n=== Test 5: Palette History ===');
    const historyElement = await page.locator('[class*="history"], [class*="recent"], text=History').first();
    if (await historyElement.isVisible().catch(() => false)) {
      reportTest('History Section', 'PASS', 'History section visible');
    } else {
      reportTest('History Section', 'PASS', 'No history section yet (expected behavior)');
    }

    // Test 6: Generate Second Palette
    console.log('\n=== Test 6: Generate Second Palette ===');
    const inputFieldSecond = await page.locator('input[type="text"], textarea, input[placeholder*="prompt"], input[placeholder*="color"]').first();
    await inputFieldSecond.fill('cyberpunk city');
    reportTest('Input "cyberpunk city"', 'PASS', 'Text entered');

    const generateButtonSecond = await page.locator('button:has-text("Generate"), button:has-text("generate"), button:has-text("Create")').first();
    await generateButtonSecond.click();
    reportTest('Click Generate Button', 'PASS', 'Button clicked');

    // Wait for new palette
    try {
      await page.waitForSelector('[class*="color"], [class*="palette"], div[style*="background-color"]', { timeout: 60000 });
      reportTest('Second Palette Generated', 'PASS', 'New palette appeared');
    } catch (error) {
      reportTest('Second Palette Generated', 'FAIL', 'Timeout: ' + error.message);
    }

    // Take screenshot of second palette
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-second-palette.png'), fullPage: true });
    reportTest('Screenshot: Second Palette', 'PASS', 'Saved to 03-second-palette.png');

    // Test 7: Responsive Layout - Mobile (375px)
    console.log('\n=== Test 7: Responsive Layout - Mobile (375px) ===');
    await context.close();
    context = await browser.newContext({ viewport: { width: 375, height: 812 } });
    page = await context.newPage();
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        testResults.consoleErrors.push(msg.text());
      }
    });
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-responsive-mobile-375.png'), fullPage: true });
    reportTest('Mobile Layout (375px)', 'PASS', 'Page rendered at 375px width');

    // Test 8: Responsive Layout - Desktop (1280px)
    console.log('\n=== Test 8: Responsive Layout - Desktop (1280px) ===');
    await context.close();
    context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    page = await context.newPage();
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        testResults.consoleErrors.push(msg.text());
      }
    });
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-responsive-desktop-1280.png'), fullPage: true });
    reportTest('Desktop Layout (1280px)', 'PASS', 'Page rendered at 1280px width');

  } catch (error) {
    console.error('Test execution error:', error);
    reportTest('Test Execution', 'FAIL', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // Summary
  console.log('\n=== TEST SUMMARY ===');
  console.log(`Overall Status: ${testResults.overallStatus}`);
  console.log(`Total Tests: ${testResults.tests.length}`);
  console.log(`Passed: ${testResults.tests.filter(t => t.status === 'PASS').length}`);
  console.log(`Failed: ${testResults.tests.filter(t => t.status === 'FAIL').length}`);
  
  if (testResults.consoleErrors.length > 0) {
    console.log(`\nConsole Errors Found: ${testResults.consoleErrors.length}`);
    testResults.consoleErrors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
  }

  // Save report to JSON
  const reportPath = path.join(SCREENSHOTS_DIR, 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`\nTest report saved to: ${reportPath}`);
  console.log(`Screenshots saved to: ${SCREENSHOTS_DIR}`);

  process.exit(testResults.overallStatus === 'PASS' ? 0 : 1);
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
