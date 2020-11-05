//aliais -> wikiAutoIndex
const { response } = require('express');
const { WriteStream } = require('fs');
const puppeteer = require('puppeteer');
const fs = require('fs');
const { max } = require('moment');
const { SSL_OP_NETSCAPE_DEMO_CIPHER_CHANGE_BUG } = require('constants');

// let link = "https://hspolicy.debatecoaches.org/Casady%20School/Burger-Fryer%20Aff"
(async () => {
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
    const page = await browser.newPage();
    let links = require('./links.json')
    // let link = "https://hspolicy.debatecoaches.org/Coppell/Patel-Yan%20Neg"
    // "https://hspolicy.debatecoaches.org/Chaminade/Barsoumian-Kim%20Neg",
    await fs.writeFile(`intel.csv`, `team,entry,notes,wiki entry,aff,plan text,advantages,neg ,k,da,cp,t,theory,case turns,case answers,dumpMisc,,\n`, function (err) {
        if (err) return console.log(err)
        console.log(`header written`)
    })
    for (j = 0; j < links.length; j++) {

        await page.goto(links[j]);
        await page.waitFor(500);
        await page.addScriptTag({ url: 'https://code.jquery.com/jquery-3.2.1.min.js' })

        // // get entries from tournament // this is TABROOM
        // let entries = []
        // entries = await page.evaluate(() => {
        //     let teamsReturn = []
        //     for (i = 1; i <= document.querySelector("#fieldsort > tbody").rows.length; i++) {
        //         teamsReturn.push(document.querySelector(`#fieldsort > tbody > tr:nth-child(${i}) > td:nth-child(4)`).innerText + " " + document.querySelector(`#fieldsort > tbody > tr:nth-child(${i}) > td:nth-child(3)`).innerText)
        //     }
        // })

        // convert into wiki links WIP


        if (links[j].includes("Aff")) { //its aff intel
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

        } else if (links[j].includes('Neg')) {
            let negReturnData = {
                rawList: [],
                cp: [],
                da: [],
                k: [],
                t: [],
                p: [],
                it: [],
                ct: [],
                ncDump: [],
                misc: []
            }

            negReturnData.rawList = await page.evaluate(() => {
                let titles = []
                for (i = 2; i <= document.querySelector("#tblCites > tbody").rows.length; i++) {
                    titles.push(document.querySelector(`#tblCites > tbody >tr:nth-child(${i}) > td:nth-child(1) > div > h4`).innerText.toLowerCase())
                }
                return titles
            })
            console.log(negReturnData)

            if (negReturnData.rawList === [] || negReturnData.rawList.length <= 1) {  // no cites, will just dump the past 1ncs 
                if (negReturnData.rawList.length === 0) {
                    negReturnData.ncDump[0] = await page.evaluate(() => {
                        let returnData = ""
                        for (i = 2; i <= document.querySelector("#tblReports > tbody").rows.length - 1; i++) {
                            if (!document.querySelector(`#tblReports > tbody > tr:nth-child(${i}) > td:nth-child(3) > div> div> p `).innerText.toLowerCase().includes('1nc')) {
                                console.log("fake entry no 1nc")
                            } else if (document.querySelector(`#tblReports > tbody > tr:nth-child(${i}) > td:nth-child(3) > div> div> p `).innerText.toLowerCase().includes('2nc')) {
                                returnData += document.querySelector(`#tblReports > tbody > tr:nth-child(${i}) > td:nth-child(3) > div> div> p `).innerText.toLowerCase().split('1nc')[1].split('2nc')[0].replace(/ and /g, "").replace(/case/g, "") + "\n"
                            } else if (document.querySelector(`#tblReports > tbody > tr:nth-child(${i}) > td:nth-child(3) > div> div> p `).innerText.toLowerCase().includes('2nr')) {
                                returnData += document.querySelector(`#tblReports > tbody > tr:nth-child(${i}) > td:nth-child(3) > div> div> p `).innerText.toLowerCase().split('1nc')[1].split('2nr')[0].toLowerCase().replace(/ and /g, "").replace(/case/g, "") + "\n"
                            }
                        }
                        return (returnData)
                    })

                    negReturnData.ncDump = negReturnData.ncDump[0].split("\n")
                    for (v = 0; v < negReturnData.ncDump.length; v++) {
                        if (negReturnData.ncDump[v] === "") {
                            negReturnData.ncDump.splice(v, 1)
                        }
                    }
                }
                else if (negReturnData.rawList[0].includes("contact")) {
                    negReturnData.ncDump[0] = await page.evaluate(() => {
                        let returnData = ""
                        for (i = 2; i <= document.querySelector("#tblReports > tbody").rows.length - 1; i++) {
                            if (!document.querySelector(`#tblReports > tbody > tr:nth-child(${i}) > td:nth-child(3) > div> div> p `).innerText.toLowerCase().includes('1nc')) {
                                console.log("fake entry no 1nc")
                            } else if (document.querySelector(`#tblReports > tbody > tr:nth-child(${i}) > td:nth-child(3) > div> div> p `).innerText.toLowerCase().includes('2nc')) {
                                returnData += document.querySelector(`#tblReports > tbody > tr:nth-child(${i}) > td:nth-child(3) > div> div> p `).innerText.toLowerCase().split('1nc')[1].split('2nc')[0].replace(/ and /g, "").replace(/case/g, "") + "\n"
                            } else if (document.querySelector(`#tblReports > tbody > tr:nth-child(${i}) > td:nth-child(3) > div> div> p `).innerText.toLowerCase().includes('2nr')) {
                                returnData += document.querySelector(`#tblReports > tbody > tr:nth-child(${i}) > td:nth-child(3) > div> div> p `).innerText.toLowerCase().split('1nc')[1].split('2nr')[0].toLowerCase().replace(/ and /g, "").replace(/case/g, "") + "\n"
                            }
                        }
                        return (returnData)
                    })

                    negReturnData.ncDump = negReturnData.ncDump[0].split("\n")
                    for (v = 0; v < negReturnData.ncDump.length; v++) {
                        if (negReturnData.ncDump[v] === "") {
                            negReturnData.ncDump.splice(v, 1)
                        }
                    }
                }
            }
            // if (negReturnData.rawList[0].toLowerCase().includes('contact')) { // no cites, prob have to do past round scrape
            //     let workingSortingList = []
            //     let argTypeFollowsNameProcessing = []
            //     let argTypeFollowsNameProcessingMisc = []
            //     let argTypeFollowsName = null
            //     negReturnData.rawList = await page.evaluate(() => {
            //         var returnList = []
            //         for (x = 2; x <= document.querySelector("#tblReports > tbody").rows.length - 1; x++) {
            //             // returnList.push(document.querySelector(`#tblReports > tbody > tr:nth-child(${x}) > td:nth-child(3) > div> div> p `).innerText.split("\n")[1].toLowerCase().replace('1nc', "").match("[a-zA-Z]").trim()) // should return the 1nc arg list
            //             returnList.push(document.querySelector(`#tblReports > tbody > tr:nth-child(${x}) > td:nth-child(3) > div> div> p `).innerText.split('1NC')[1].split("2NC")[0].toLowerCase().match("[a-zA-Z]").trim()) // should return the 1nc arg list
            //             // arg detection... if rawlist last ends with CP/DA/K, then know the arguemtn type is after the arg name... if you end on a arg name such as states then you know the arg name is in front or not there..... to diferentiate betwen not there and in front of arg name just do a  includes for the "CP/DA/K"
            //         }
            //         return(returnList)
            //     })

            //     for (i = 0; i < negReturnData.rawList.length; i++) {
            //         workingSortingList = negReturnData.rawList[i].replace(' and ', "")
            //         workingSortingList = workingSortingList.replace(' & ', "")
            //         workingSortingList = workingSortingList.replace('case', "")

            //         if (workingSortingList[workingSortingList.length - 1] === 'cp' || workingSortingList[workingSortingList.length - 1] === 'da' || workingSortingList[workingSortingList.length - 1] === 'k') { // arg type name after arg name
            //             argTypeFollowsNameProcessing = workingSortingList
            //             argTypeFollowsNameProcessing = argTypeFollowsNameProcessing.split(" ")
            //             argTypeFollowsNameProcessingMisc = argTypeFollowsNameProcessing
            //             for (z = 0; z < argTypeFollowsNameProcessing.length; z++) {
            //                 if (argTypeFollowsNameProcessing[z].includes("t-")) {
            //                     negReturnData.t.push(argTypeFollowsNameProcessing[z])
            //                     argTypeFollowsNameProcessingMisc.splice(z, 1)
            //                 }
            //                 if (argTypeFollowsNameProcessing[z] === 'cp') {
            //                     negReturnData.cp.push(argTypeFollowsNameProcessing[z - 1] + argTypeFollowsNameProcessing[z])
            //                     argTypeFollowsNameProcessingMisc.splice(z - 1, 2)
            //                 }
            //                 if (argTypeFollowsNameProcessing[z] === 'da') {
            //                     negReturnData.da.push(argTypeFollowsNameProcessing[z - 1] + argTypeFollowsNameProcessing[z])
            //                     argTypeFollowsNameProcessingMisc.splice(z - 1, 2)
            //                 }
            //                 if (argTypeFollowsNameProcessing[z] === 'k') {
            //                     negReturnData.k.push(argTypeFollowsNameProcessing[z - 1] + argTypeFollowsNameProcessing[z])
            //                     argTypeFollowsNameProcessingMisc.splice(z - 1, 2)
            //                 }
            //             }
            //             negReturnData.misc.push(argTypeFollowsNameProcessingMisc.join(' '))
            //         }
            //     }

            // } else {

            for (i = 0; i < negReturnData.rawList.length; i++) {
                if ((negReturnData.rawList[i].includes('cp ') && negReturnData.rawList[i].substring(0, (negReturnData.rawList[i].length) / 2).includes('cp ')) || negReturnData.rawList[i].includes('cp-') || negReturnData.rawList[i].includes('cp:') || negReturnData.rawList[i].includes('pic ') || negReturnData.rawList[i].includes('pic-') || negReturnData.rawList[i].includes('pic:')) {
                    negReturnData.cp.push(negReturnData.rawList[i])
                }
                else if ((negReturnData.rawList[i].includes('da ') && negReturnData.rawList[i].substring(0, (negReturnData.rawList[i].length) / 2).includes('da ')) || negReturnData.rawList[i].includes('da-') || negReturnData.rawList[i].includes('da:')) {
                    negReturnData.da.push(negReturnData.rawList[i])
                }
                else if ((negReturnData.rawList[i].charAt(0) === "k" || negReturnData.rawList[i].substring(0, (negReturnData.rawList[i].length) / 2).includes('k ')) || negReturnData.rawList[i].includes('k-') || negReturnData.rawList[i].includes('k:')) {
                    if (!negReturnData.rawList[i].includes('da ') && !negReturnData.rawList[i].includes('da-') && !negReturnData.rawList[i].includes('da:')) {
                        negReturnData.k.push(negReturnData.rawList[i])
                    }
                }
                else if ((negReturnData.rawList[i].charAt(0) === "t" || negReturnData.rawList[i].substring(0, (negReturnData.rawList[i].length) / 2).includes('t ')) || negReturnData.rawList[i].includes('t-') || negReturnData.rawList[i].includes('t:')) { // makee sure that "t " is in the front not the back
                    if (!negReturnData.rawList[i].includes('da ') && !negReturnData.rawList[i].includes('da-') && !negReturnData.rawList[i].includes('da:')) {
                        if (!negReturnData.rawList[i].includes('k ') && !negReturnData.rawList[i].includes('k-') && !negReturnData.rawList[i].includes('k:')) {
                            if (!negReturnData.rawList[i].includes('ct ') && !negReturnData.rawList[i].includes('ct-') && !negReturnData.rawList[i].includes('ct:')) {
                                if (!negReturnData.rawList[i].includes('it ') && !negReturnData.rawList[i].includes('it-') && !negReturnData.rawList[i].includes('it:')) {
                                    negReturnData.t.push(negReturnData.rawList[i])
                                }
                            }
                        }
                    }
                }
                else if (negReturnData.rawList[i].charAt(0) === "p" || negReturnData.rawList[i].includes('p-') || negReturnData.rawList[i].includes('p:')) {
                    negReturnData.p.push(negReturnData.rawList[i])
                }
                else if ((negReturnData.rawList[i].substring(0, 2) === "it" || negReturnData.rawList[i].substring(0, (negReturnData.rawList[i].length) / 2).includes('it ')) || negReturnData.rawList[i].includes('it-') || negReturnData.rawList[i].includes('it:')) {
                    negReturnData.it.push(negReturnData.rawList[i])
                }
                else if ((negReturnData.rawList[i].substring(0, 2) === "ct" || negReturnData.rawList[i].substring(0, (negReturnData.rawList[i].length) / 2).includes('ct ')) || negReturnData.rawList[i].includes('ct-') || negReturnData.rawList[i].includes('ct:')) {
                    negReturnData.it.push(negReturnData.rawList[i])
                    // combine ct & it

                }
            }
            // }
            console.log(negReturnData)

            // // this line here means it wont do multi processing yet... REMOVE before multi processing, otherwise it will write the header every other line
            // await fs.writeFile(`intel.csv`, `team,entry,notes,wiki entry,aff,plan text,advantages,neg ,k,da,cp,t,theory,case turns,case answers,dumpMisc,,\n`, function (err) {
            //     if (err) return console.log(err)
            //     console.log(`header written`)
            // })

            // find max number
            let maxNumberArray = [parseInt(negReturnData.cp.length), parseInt(negReturnData.da.length), parseInt(negReturnData.it.length), parseInt(negReturnData.k.length), parseInt(negReturnData.p.length), parseInt(negReturnData.t.length), parseInt(negReturnData.ncDump.length)]
            maxNumberArray = maxNumberArray.sort((a, b) => a - b)
            console.log("MAX# ARRAY: " + maxNumberArray)
            var writeLine = `,,,,,,,${links[j]},`
            console.log("I NUMBER CONDITION: " + maxNumberArray[maxNumberArray.length - 1])
            for (i = 0; i < maxNumberArray[maxNumberArray.length - 1]; i++) {
                console.log("I" + i)
                console.log(negReturnData.k.length) //22
                await page.waitFor(200)
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
                // await page.waitFor(200)
                // writeLine += ","
                // console.log(negReturnData.ct.length)
                // if (negReturnData.it.length > i) {
                //     writeLine += negReturnData.ct[i]
                //     console.log("ct")
                // }
                await page.waitFor(500)
                console.log("NEGRETURNNCDUMPLENGHT" + negReturnData.ncDump.length)
                if (negReturnData.ncDump.length === 0) {
                    // writeLine += `,,,,\n`
                    writeLine += ",,,,\n"
                    console.log("TRATIDONAL")
                } else if (negReturnData.ncDump.length > 0) {
                    console.log(negReturnData.ncDump)
                    writeLine += `,,${negReturnData.ncDump[i]},,\n`
                }
                await fs.appendFile('intel.csv', writeLine, function (err) {
                    if (err) return console.log(err)
                    console.log(`intel written: ${writeLine}`)
                    writeLine = `,,,,,,,,`
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
    }
})();
