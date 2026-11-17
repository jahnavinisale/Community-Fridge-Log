import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = path.resolve('docs', 'screenshots');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function run() {
  console.log('[Screenshots] Launching headless Chrome from:', CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    console.log('[Screenshots] Navigating to login page...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });

    // Fill credentials
    await page.type('#login-email', 'admin@communityfridge.org');
    await page.type('#login-password', 'AdminPass123!');
    await page.click('button[type="submit"]');

    console.log('[Screenshots] Logged in, waiting for dashboard...');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1000));

    // 1. Dashboard screenshot
    const dashboardPath = path.join(OUT_DIR, 'dashboard.png');
    await page.screenshot({ path: dashboardPath, fullPage: false });
    console.log('[Screenshots] Saved:', dashboardPath);

    // 2. Dispose Modal screenshot
    console.log('[Screenshots] Opening Dispose Modal...');
    // Find first Dispose button on dashboard or inventory
    const disposeBtn = await page.$('button[aria-label^="Dispose"]');
    if (disposeBtn) {
      await disposeBtn.click();
      await page.waitForSelector('[role="dialog"]', { visible: true });
      await new Promise((r) => setTimeout(r, 600));

      const modalPath = path.join(OUT_DIR, 'dispose-modal.png');
      await page.screenshot({ path: modalPath, fullPage: false });
      console.log('[Screenshots] Saved:', modalPath);

      // Close modal
      await page.keyboard.press('Escape');
      await new Promise((r) => setTimeout(r, 400));
    }

    // 3. Logs page screenshot
    console.log('[Screenshots] Navigating to Logs page...');
    await page.goto('http://localhost:5173/logs/collections', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1000));

    const logsPath = path.join(OUT_DIR, 'logs-page.png');
    await page.screenshot({ path: logsPath, fullPage: false });
    console.log('[Screenshots] Saved:', logsPath);

    // 4. Mobile view screenshot
    console.log('[Screenshots] Switching to mobile viewport (390x844)...');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1000));

    const mobilePath = path.join(OUT_DIR, 'mobile-view.png');
    await page.screenshot({ path: mobilePath, fullPage: false });
    console.log('[Screenshots] Saved:', mobilePath);

    console.log('[Screenshots] All 4 screenshots captured successfully!');
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('[Screenshots] Failed:', err);
  process.exit(1);
});
