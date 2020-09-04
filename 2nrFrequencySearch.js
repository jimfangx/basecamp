// https://hspolicy19.debatecoaches.org/

// working: https://hspolicy19.debatecoaches.org/Archbishop%20Mitty/Patwa-Aggarwal%20Aff
const puppeteer = require('puppeteer');

(async (name) => {
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null })
    const page = await browser.newPage();
    await page.goto(`https://hspolicy19.debatecoaches.org/Archbishop%20Mitty/Patwa-Aggarwal%20Aff`);
    await page.waitFor(500);

    var twonrList = await page.evaluate(() => {
        var roundReportBlocks = []
        var returnList = []


        // ----------------Seperated by <BR>----------------
        for (i = 1; i < document.querySelector("#tblReports > tbody").rows.length; i++) {
            roundReportBlocks.push(document.querySelector(`#tblReports > tbody > tr:nth-child(${i + 1}) > td:nth-child(3) > div > div > p`))
            // br:nth-child(${$("br", document.querySelector("#tblReports > tbody > tr:nth-child(2) > td:nth-child(3) > div > div > p")).length})`
            // console.log(roundReportBlocks)
        }
        console.log(roundReportBlocks)
        // clean list into a list of 2NR - <arg> or 2NR <arg> 
        for (i = 0; i < roundReportBlocks.length; i++) {
            // console.log(roundReportBlocks[i])
            if (!roundReportBlocks[i].innerHTML.includes('2ar') && !roundReportBlocks[i].innerHTML.includes('2AR')) {
                returnList.push(roundReportBlocks[i].innerHTML.split('<br>').pop())
            } else if (roundReportBlocks[i].innerHTML.includes('2ar') || roundReportBlocks[i].innerHTML.includes('2AR')) {

                returnList.push(roundReportBlocks[i].innerHTML.substring(roundReportBlocks[i].innerHTML.indexOf("2nr"), roundReportBlocks[i].innerHTML.indexOf("2ar")))
                if (returnList[returnList.length - 1] === "") {
                    returnList.splice(returnList.length - 1, 1)
                    returnList.push(roundReportBlocks[i].innerHTML.substring(roundReportBlocks[i].innerHTML.indexOf("2NR"), roundReportBlocks[i].innerHTML.indexOf("2AR")))
                }
            }
        }
        console.log(returnList)

        // clean list into just args - remove the 2NR label
        for (i = 0; i < returnList.length; i++) {
            // troll/fake/entries that don't contain 2nr entries checking
            if (!returnList[i].includes('2nr') && !returnList[i].includes('2NR')) {
                returnList.splice(i, 1)
                i--;
            } else {
                returnList[i] = returnList[i].replace('2nr', "")
                returnList[i] = returnList[i].replace('2NR', "")
                returnList[i] = returnList[i].replace('2NR -', "")
                returnList[i] = returnList[i].replace('2nr -', "")
                returnList[i] = returnList[i].replace('2NR-', "")
                returnList[i] = returnList[i].replace('2nr-', "")
                returnList[i] = returnList[i].replace('2NR:', "")
                returnList[i] = returnList[i].replace('2nr:', "")
                returnList[i] = returnList[i].replace('-', "")
                returnList[i] = returnList[i].replace('<br>', "")
                returnList[i] = returnList[i].replace('</br>', "")
                returnList[i] = returnList[i].replace('<br/>', "")
                returnList[i] = returnList[i].replace('<del>', "")
                returnList[i] = returnList[i].replace('<del/>', "")
                returnList[i] = returnList[i].replace('</del>', "")
                returnList[i] = returnList[i].trim()
            }
        }
        console.log(returnList)
    })
})();
