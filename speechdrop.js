const puppeteer = require('puppeteer');

// http request receive code with room text or competiting teams + room name formatting

module.exports = (async (name) => {
    return new Promise((resolve, reject) => {
        try {
            const browser = await puppeteer.launch({ headless: false });
            const page = await browser.newPage();
            await page.goto(`https://speechdrop.net`);
            await page.waitFor(500);
            await page.type('input.room-text', `${name}`)
            await page.click(`input.button`)
            await page.waitForNavigation()
            var pageURL = page.url()
            await browser.close()
            resolve(pageURL)
        } catch (err) {
            reject(err)
        }
    })
})();