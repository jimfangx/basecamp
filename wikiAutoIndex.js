const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(`https://hspolicy.debatecoaches.org/Main/`);
    await page.waitFor(500);
    await page.addScriptTag({ url: 'https://code.jquery.com/jquery-3.2.1.min.js' })
    let masterList = []
 
    masterList = await page.evaluate(() => {
        var returnList = []
        for (i = 0; i < $("#leftPanels > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > p").children('span').length
            ; i++) {
                let school = {
                    name: "",
                    schoolUrl: "",
                    teams: {
                    }
                }
                school.name = $("#leftPanels > div:nth-child(2) > div > div:nth-child(2) > p").children('span').eq(1).text()
                
                $("#leftPanels > div:nth-child(2) > div > div:nth-child(2) > p").children('span').eq(1).each(function(index){
                    school.schoolUrl = ($(this).attr('href'));
                });
                // $('.productLink > a').each(function(index){
                //     school.schoolUrl = ($(this).attr('href'));
                // });
                returnList.push(school)
            }
            console.log(returnList)
            return returnList
        // document.querySelector("#leftPanels > div:nth-child(2) ")
    // document.querySelector("#leftPanels > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > p")
    // $("#leftPanels > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > p").children('span').length
    })

    console.log(masterList)

    const teamPage = await browser.newPage();
    teamPage.goto 
    // $("#leftPanels > div:nth-child(2) > div > div:nth-child(2) > p").children('span').eq(1).attr('href')
})();