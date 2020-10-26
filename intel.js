const { response } = require('express');
const puppeteer = require('puppeteer');

// let link = "https://hspolicy.debatecoaches.org/Casady%20School/Burger-Fryer%20Aff"
(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto("https://hspolicy.debatecoaches.org/Casady%20School/Burger-Fryer%20Aff");
    await page.waitFor(500);
    
    if ("https://hspolicy.debatecoaches.org/Casady%20School/Burger-Fryer%20Aff".includes("Aff")) { //its aff intel
        let affReturnData = {
            titles: [],
            planText: []
        }
        // let pageHTML = response.text().toLowerCase()
        affReturnData.titles = await page.evaluate(() => {
            let titles = []
            for(i=2; i<=document.querySelector("#tblCites > tbody").rows.length; i++) {
                titles.push(document.querySelector(`#tblCites > tbody >tr:nth-child(${i}) > td:nth-child(1) > div > h4`).innerText)
            }
            return titles
        })
        console.log(affReturnData)

        // while (pageHTML.includes(`the united states federal government should `)) {
        //     let planText = pageHTML.indexOf(`the united states federal government should`)-1
        // }
        
    }

})();