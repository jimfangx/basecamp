const puppeteer = require('puppeteer');

// http request receive code with room text or competiting teams + room name formatting

// module.exports = async function (name) {
    
// }
module.exports = async function (name) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(`https://speechdrop.net`);
    await page.waitFor(500);
    await page.type('input.room-text', `${name}`)
    await page.click(`input.button`)
    await page.waitForNavigation()
    var pageURL = page.url()
    await browser.close()
    return (pageURL)
}


// (async () => {
//     const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();
//     await page.goto(`https://speechdrop.net`);
//     await page.waitFor(500);
//     await page.type('input.room-text', `testtestest`)
//     await page.click(`input.button`)
//     await page.waitForNavigation()
//     var pageURL = page.url()
//     await browser.close()
//     return (pageURL)
//     // console.log(pageURL)
// })();