const { response } = require('express');
const puppeteer = require('puppeteer');

// let link = "https://hspolicy.debatecoaches.org/Casady%20School/Burger-Fryer%20Aff"
(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    let link = "https://hspolicy.debatecoaches.org/Coppell/Patel-Yan%20Neg"
    await page.goto(link);
    await page.waitFor(500);

    if (link.includes("Aff")) { //its aff intel
        let affReturnData = {
            titles: [],
            planText: []
        }
        // let pageHTML = response.text().toLowerCase()
        affReturnData.titles = await page.evaluate(() => {
            let titles = []
            for (i = 2; i <= document.querySelector("#tblCites > tbody").rows.length; i++) {
                titles.push(document.querySelector(`#tblCites > tbody >tr:nth-child(${i}) > td:nth-child(1) > div > h4`).innerText)
            }
            return titles
        })
        console.log(affReturnData)

        // while (pageHTML.includes(`the united states federal government should `)) {
        //     let planText = pageHTML.indexOf(`the united states federal government should`)-1
        // }

    } else if (link.includes('Neg')) {
        let negReturnData = {
            rawList: [],
            cp: [],
            da: [],
            k: [],
            t: []
        }

        negReturnData.rawList = await page.evaluate(() => {
            let titles = []
            for (i = 2; i <= document.querySelector("#tblCites > tbody").rows.length; i++) {
                titles.push(document.querySelector(`#tblCites > tbody >tr:nth-child(${i}) > td:nth-child(1) > div > h4`).innerText.toLowerCase())
            }
            return titles
        })
        console.log(negReturnData)

        for (i = 0; i < negReturnData.rawList.length; i++) {
            if (negReturnData.rawList[i].includes('cp ') || negReturnData.rawList[i].includes('cp-') || negReturnData.rawList[i].includes('cp:')) {
                negReturnData.cp.push(negReturnData.rawList[i])
            }
            else if (negReturnData.rawList[i].includes('da ') || negReturnData.rawList[i].includes('da-') || negReturnData.rawList[i].includes('da:')) {
                negReturnData.da.push(negReturnData.rawList[i])
            }
            else if (negReturnData.rawList[i].includes('k ') || negReturnData.rawList[i].includes('k-') || negReturnData.rawList[i].includes('k:')) {
                if (!negReturnData.rawList[i].includes('da ') && !negReturnData.rawList[i].includes('da-') && !negReturnData.rawList[i].includes('da:')) {
                    negReturnData.k.push(negReturnData.rawList[i])
                }
            } else if (negReturnData.rawList[i].includes('t ') || negReturnData.rawList[i].includes('t-') || negReturnData.rawList[i].includes('t:')) {
                if (!negReturnData.rawList[i].includes('da ') && !negReturnData.rawList[i].includes('da-') && !negReturnData.rawList[i].includes('da:')) {
                    if (!negReturnData.rawList[i].includes('k ') && !negReturnData.rawList[i].includes('k-') && !negReturnData.rawList[i].includes('k:')) {
                        negReturnData.t.push(negReturnData.rawList[i])
                    }
                }
            }
        }
        console.log(negReturnData)

        // todo: dedev (case turns aka it), p (theory) https://hspolicy.debatecoaches.org/Chaminade/Barsoumian-Kim%20Neg && replacee duplicates/ diff veersions
    }

})();