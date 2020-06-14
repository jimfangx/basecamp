const puppeteer = require('puppeteer');

(async () => {

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(`https://speechdrop.net`);
    await page.waitFor(500);
    await page.type('input.room-text', `ColPre GF AFF vs ColPre HF NEG - Test`)
    await page.click(`input.button`)
    await page.waitForNavigation()
    console.log(page.url())
    await browser.close()
})();