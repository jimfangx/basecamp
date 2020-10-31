//aliais -> wikiAutoIndex
const { response } = require('express');
const { WriteStream } = require('fs');
const puppeteer = require('puppeteer');
const fs = require('fs');

// let link = "https://hspolicy.debatecoaches.org/Casady%20School/Burger-Fryer%20Aff"
(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    let link = "https://hspolicy.debatecoaches.org/Chaminade/Barsoumian-Kim%20Neg"
    // let link = "https://hspolicy.debatecoaches.org/Coppell/Patel-Yan%20Neg"
    await page.goto(link);
    await page.waitFor(500);

    // get entries from tournament
    let entries = []
    entries = await page.evaluate(() => {
        let teamsReturn = []
        for (i = 1; i <= document.querySelector("#fieldsort > tbody").rows.length; i++) {
            teamsReturn.push(document.querySelector(`#fieldsort > tbody > tr:nth-child(${i}) > td:nth-child(4)`).innerText + " " + document.querySelector(`#fieldsort > tbody > tr:nth-child(${i}) > td:nth-child(3)`).innerText)
        }
    })

    // convert into wiki links WIP


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
            t: [],
            p: [],
            it: []
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
            if ((negReturnData.rawList[i].includes('cp ') && negReturnData.rawList[i].substring(0, (negReturnData.rawList[i].length) / 2).includes('cp ')) || negReturnData.rawList[i].includes('cp-') || negReturnData.rawList[i].includes('cp:') || negReturnData.rawList[i].includes('pic ') || negReturnData.rawList[i].includes('pic-') || negReturnData.rawList[i].includes('pic:')) {
                negReturnData.cp.push(negReturnData.rawList[i])
            }
            else if ((negReturnData.rawList[i].includes('da ') && negReturnData.rawList[i].substring(0, (negReturnData.rawList[i].length) / 2).includes('da ')) || negReturnData.rawList[i].includes('da-') || negReturnData.rawList[i].includes('da:')) {
                negReturnData.da.push(negReturnData.rawList[i])
            }
            else if ((negReturnData.rawList[i].charAt(0) === "k" && negReturnData.rawList[i].substring(0, (negReturnData.rawList[i].length) / 2).includes('k ')) || negReturnData.rawList[i].includes('k-') || negReturnData.rawList[i].includes('k:')) {
                if (!negReturnData.rawList[i].includes('da ') && !negReturnData.rawList[i].includes('da-') && !negReturnData.rawList[i].includes('da:')) {
                    negReturnData.k.push(negReturnData.rawList[i])
                }
            }
            else if ((negReturnData.rawList[i].charAt(0) === "t" && negReturnData.rawList[i].substring(0, (negReturnData.rawList[i].length) / 2).includes('t ')) || negReturnData.rawList[i].includes('t-') || negReturnData.rawList[i].includes('t:')) { // makee sure that "t " is in the front not the back
                if (!negReturnData.rawList[i].includes('da ') && !negReturnData.rawList[i].includes('da-') && !negReturnData.rawList[i].includes('da:')) {
                    if (!negReturnData.rawList[i].includes('k ') && !negReturnData.rawList[i].includes('k-') && !negReturnData.rawList[i].includes('k:')) {
                        negReturnData.t.push(negReturnData.rawList[i])
                    }
                }
            }
            else if (negReturnData.rawList[i].charAt(0) === "p" || negReturnData.rawList[i].includes('p-') || negReturnData.rawList[i].includes('p:')) {
                negReturnData.p.push(negReturnData.rawList[i])
            }
            else if ((negReturnData.rawList[i].substring(0, 2) === "it" && negReturnData.rawList[i].substring(0, (negReturnData.rawList[i].length) / 2).includes('it ')) || negReturnData.rawList[i].includes('it-') || negReturnData.rawList[i].includes('it:')) {
                negReturnData.it.push(negReturnData.rawList[i])
            }
        }
        console.log(negReturnData)

        // this line here means it wont do multi processing yet... REMOVE before multi processing, otherwise it will write the header every other line
        await fs.writeFile(`intel.csv`, `team,entry,notes,wiki entry,aff,plan text,advantages,neg ,k,da,cp,t,theory,case turns,case answers,,,\n`, function (err) {
            if (err) return console.log(err)
            console.log(`header written`)
        })

        for (i = 0; i <= 22; i++) {
            var writeLine = ",,,,,,,,"
            console.log("I" + i)
            console.log(negReturnData.k.length) //22
            if (negReturnData.k.length > i) { // there are still k args left
                writeLine += negReturnData.k[i]
                console.log("k")
            }
            await page.waitFor(200)
            writeLine += ","
            console.log(negReturnData.da.length) //0
            if (negReturnData.da.length > i) {
                writeLine += negReturnData.da[i]
                console.log("da")
            }
            await page.waitFor(200)
            writeLine += ","
            console.log(negReturnData.cp.length) //3
            if (negReturnData.cp.length > i) {
                writeLine += negReturnData.cp[i]
                console.log("cp")
            }
            await page.waitFor(200)
            writeLine += ","
            console.log(negReturnData.t.length) //1
            if (negReturnData.t.length > i) {
                writeLine += negReturnData.t[i]
                console.log("t")
            }
            await page.waitFor(200)
            writeLine += ","
            console.log(negReturnData.p.length) //3
            if (negReturnData.p.length > i) {
                writeLine += negReturnData.p[i]
                console.log("p")
            }
            await page.waitFor(200)
            writeLine += ","
            console.log(negReturnData.it.length) //1
            if (negReturnData.it.length > i) {
                writeLine += negReturnData.it[i]
                console.log("it")
            }
            await page.waitFor(200)
            writeLine += ",,,,\n"
            await fs.appendFile('intel.csv', writeLine, function (err) {
                if (err) return console.log(err)
                console.log(`intel written`)
            })
        }
        // // idk if we need duplicate detection lol
        // for (i=0; i<negReturnData.cp.length; i++) {
        //     if (negReturnData.cp[i])
        // }
        // for (i=0; i<negReturnData.da.length; i++) {

        // }
        // for (i=0; i<negReturnData.it.length; i++) {

        // }
        // for (i=0; i<negReturnData.k.length; i++) {

        // }
        // for (i=0; i<negReturnData.p.length; i++) {

        // }
        // for (i=0; i<negReturnData.t.length; i++) {

        // }

        // todo: dedev (case turns aka it), p (theory) https://hspolicy.debatecoaches.org/Chaminade/Barsoumian-Kim%20Neg && replacee duplicates/ diff veersions
    }

})();