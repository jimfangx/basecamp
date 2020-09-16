const electron = require('electron')
const { app, BrowserWindow, ipcMain, Menu, ClientRequest, session, powerSaveBlocker, globalShortcut } = electron;
let mainWindow;
let authWindow;
let linkWindow;
const puppeteer = require('puppeteer');
const fs = require('fs');
const { start } = require('repl');


app.whenReady().then(() => {
    mainWindow = mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            backgroundThrottling: false // prevent background sleeping
        }
    });

    mainWindow.loadFile('main.html')
    mainWindow.webContents.openDevTools()

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

ipcMain.on('tabLinkWindowOpenReqMainjsIndexjs', (event) => { //tab link window open request received
    authWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    authWindow.loadFile('tabLink.html')
    authWindow.show()
})

ipcMain.on('tabroom.comCredentialstabLinkjsindexjs', async (event, data) => {
    console.log("received!")
    // console.log(data)
    fs.writeFileSync('./tabCred.json', data);
    authWindow.close()
    var returnData = await getUpcomingTournamentData(data)
    // await console.log("PRINTING: " + returnData)
    await mainWindow.webContents.send('tabAuthDataReturnIndexjsMainjs', returnData)

    // no api ugh. :( web scraping ensues with https://learnscraping.com/nodejs-web-scraping-with-puppeteer/
})



async function getUpcomingTournamentData(data) {
    const browser = await puppeteer.launch({ headless: true, defaultViewport: null })
    const page = await browser.newPage();
    await page.goto(`https://www.tabroom.com/index/index.mhtml`)
    // await page.goto(`file:///D:/Downloads/Tabroom.com.html`)
    // await page.addScriptTag({ url: 'https://code.jquery.com/jquery-3.2.1.min.js' })
    await page.waitFor(500);
    await page.click(`#toprow > span.login > a`)
    await page.type(`#user\\a \\9 \\9 \\9 \\9 \\9 name`, data[0])
    await page.waitFor(200);
    await page.type(`#password`, data[1])
    await page.waitFor(200);
    await page.click(`#login-box > form > fieldset > input`)
    await page.waitFor(500) // original 200, need to test for tolerance 
    // debugger
    var returnData = await page.evaluate(() => {
        // debugger
        var evaluateCombinationData = []
        evaluateCombinationData.push(document.querySelector("#content > div.main > span.threefifths.nospace > h3").innerText) //  name
        // future
        // debugger
        var upcomingTournObj = {
            name: "",
            date: "",
            event: "",
            status: ""
        }
        // console.log()
        try {
            var mostRecentFuture = document.querySelector("#upcoming > tbody").rows.length
            upcomingTournObj.name = document.querySelector(`#upcoming > tbody > tr:nth-child(${mostRecentFuture}) > td:nth-child(1) > div`).innerText.trim()
            upcomingTournObj.date = document.querySelector(`#upcoming > tbody > tr:nth-child(${mostRecentFuture}) > td:nth-child(2)`).innerText.trim()
            upcomingTournObj.event = document.querySelector(`#upcoming > tbody > tr:nth-child(${mostRecentFuture}) > td:nth-child(3)`).innerText.trim()
            upcomingTournObj.status = document.querySelector(`#upcoming > tbody > tr:nth-child(${mostRecentFuture}) > td:nth-child(5)`).innerText.trim()
            evaluateCombinationData.push(upcomingTournObj)
            // evaluateCombinationData.push(document.querySelector("div.nowrap:nth-child(1)").innerText)
        } catch (err) {
            console.log(err)
            upcomingTournObj.name = 'noUpcomingTournamentsBasecamp'
            evaluateCombinationData.push(upcomingTournObj)
            // evaluateCombinationData.push(`noUpcoming`)
        }
        //there is a scheduled tourn, get date & status


        // current - if has current dont show the upcoming. check info box for links, if found, find a way to beam to phone
        var currentTournObj = {
            name: "",
            round: "",
            start: "",
            room: "",
            side: "",
            oppoent: "",
            judge: "",
            paradigmLink: ""
        }
        try {
            var mostRecentCurrent = document.querySelector("#content > div.main > div.screens.current > div.full.nospace.martopmore > table > tbody").rows.length
            for (var x = mostRecentCurrent; x > 0; x--) {
                console.log("MOST RECET" + mostRecentCurrent)
                console.log("X" + x)
                currentTournObj.name = document.querySelector("#content > div.main > div.screens.current > div.full.nospace.marbottommore.padtopmore.padbottom.ltborderbottom > span.threefifths.nospace > h5").innerText.trim()  // this may break if people are entered in 2 tournaments at once - will only show thee top most one
                currentTournObj.round = document.querySelector(`#content > div.main > div.screens.current > div.full.nospace.martopmore > table > tbody > tr:nth-child(${x}) > td:nth-child(1)`).innerText.trim()
                currentTournObj.start = document.querySelector(`#content > div.main > div.screens.current > div.full.nospace.martopmore > table > tbody > tr:nth-child(${x}) > td:nth-child(2)`).innerText.trim()
                currentTournObj.room = document.querySelector(`#content > div.main > div.screens.current > div.full.nospace.martopmore > table > tbody > tr:nth-child(${x}) > td:nth-child(3)`).innerText.trim()
                if (currentTournObj.room === "") {
                    currentTournObj.room = "Online"
                }
                currentTournObj.side = document.querySelector(`#content > div.main > div.screens.current > div.full.nospace.martopmore > table > tbody > tr:nth-child(${x}) > td:nth-child(4)`).innerText.trim()
                currentTournObj.oppoent = document.querySelector(`#content > div.main > div.screens.current > div.full.nospace.martopmore > table > tbody > tr:nth-child(${x}) > td:nth-child(5)`).innerText.trim()
                currentTournObj.judge = document.querySelector(`#content > div.main > div.screens.current > div.full.nospace.martopmore > table > tbody > tr:nth-child(${x}) > td:nth-child(6) > div > span`).innerText.substring(1).trim()
                // OLD - currentTournObj.paradigmLink = document.querySelector(`#content > div.main > div.screens.current > div.full.nospace.martopmore > table > tbody > tr:nth-child(3) > td:nth-child(6) > div > span > span > a`).href
                currentTournObj.paradigmLink = document.querySelector("#content > div.main > div.screens.current > div.martopmore > table > tbody > tr:nth-child(2) > td:nth-child(6) > div > span > span > a").href

                var startHours = currentTournObj.start.substring(currentTournObj.start.indexOf(currentTournObj.start.match(/\d/)), currentTournObj.start.indexOf('\n') - 3).trim()
                // console.log(startHours)
                // startHours = convertTime12to24(startHours)

                const [time, modifier] = startHours.split(' ');

                let [hours, minutes] = time.split(':');

                if (hours === '12') {
                    hours = '00';
                }

                if (modifier === 'PM') {
                    hours = parseInt(hours, 10) + 12;
                }
                startHours = `${hours}:${minutes}`

                console.log("START TIME" + startHours)
                var currentTime = new Date().getHours() + ":" + new Date().getMinutes()
                console.log("CURRENT TIME" + currentTime)
                console.log(startHours.substring(0, startHours.indexOf(":")))
                console.log(startHours.substring(startHours.indexOf(':')))
                console.log(evaluateCombinationData)

                // // check date make sure day of week is the same as today - cancelled for now as covid & tab doesnt spec timezone

                // if (Date().substring(0, 3) === currentTournObj.start.substring(0, 3)) {
                //     if (startHours.substring(0, startHours.indexOf(":")) >= new Date().getHours()) { //11
                //         // if (startHours.substring(startHours.indexOf(':')+1) > new Date().getMinutes()) {
                //         console.log("pushing! hour in front")
                //         evaluateCombinationData.push(currentTournObj)
                //         break;
                //         // }
                //     } else if (startHours.substring(0, startHours.indexOf(":")) === new Date().getHours()) {
                //         if (startHours.substring(startHours.indexOf(':') + 1) >= new Date().getMinutes()) {
                //             console.log(`pushing! mins in front, same hour`)
                //             evaluateCombinationData.push(currentTournObj)
                //             break;
                //         }
                //     }
                // }
                // else {
                //     mostRecentCurrent++;
                // }
            }
            console.log("FINAL LENGTH" + evaluateCombinationData.length)
            // if (evaluateCombinationData.length < 3) { //- lets see what happens - covid times are all messed up cause tab doesnt keep timezones
            //     currentTournObj.name = 'noCurrentTournamentsBasecamp'
            //     evaluateCombinationData.push(currentTournObj)
            // }
            evaluateCombinationData.push(currentTournObj) // i am just gonna push it and see what happens
        } catch (err) {
            console.log(`ERORROEORRR: `)
            console.log(err)
            if (err) {
                currentTournObj.name = 'noCurrentTournamentsBasecamp'
                if (evaluateCombinationData.length < 3) {
                    evaluateCombinationData.push(currentTournObj)
                }
            }
        }
        console.log("AFTER ROUNDS")
        console.log(evaluateCombinationData)
        // return results table length for k/d calc:
        var resultsTableLength = [];
        if ((document.querySelector("#content > div.main > div.results.screens").getElementsByTagName('table').length) > 2) {
            for (z = 1; z <= document.querySelector("#content > div.main > div.results.screens").getElementsByTagName('table').length - 2; z++) {
                console.log(z)
                resultsTableLength.push(document.querySelector(`#content > div.main > div.results.screens > .hasStickyHeaders:nth-of-type(${z})`).rows.length - 1) // # of tournaments given different histories
            }
        } else {
            try {
                resultsTableLength.push(document.querySelector("#content > div.main > div.results.screens > table > tbody").rows.length) // number of tournaments given 1 history
            } catch (err) {
                resultsTableLength.push(0)
                console.log(err)
            }
        }
        evaluateCombinationData.push(resultsTableLength)
        return evaluateCombinationData;
    })
    // navigate win loss tournament lis document.querySelector("#content > div.main > div.results.screens > table > tbody > tr:nth-child(2)")
    // returnData.push(await page.evaluate(page.querySelector("#content > div.main > span.threefifths.nospace > h3").innerText))
    await console.log(returnData)
    await page.waitFor(200)
    await console.log(returnData[returnData.length - 1])
    //conpetition gathering
    var winNumberIncludesBye = 0;
    var loseNumber = 0;
    // debugger
    if (returnData[returnData.length - 1].length > 1) { //multiple schools / histories at different places
        for (i = 0; i < returnData[returnData.length - 1].length; i++) { // for each history block
            await console.log("FIRST LOOP CONDOTION" + returnData[returnData.length - 1].length)
            await console.log(`I: ${i}`)
            for (j = 1; j <= returnData[returnData.length - 1][i]; j++) { // for each tournament
                // await console.log("j" + j)
                await page.click(`#results`) // have to click results to make page visible
                await page.waitFor(200)
                await page.click(`#content > div.main > div.results.screens > table:nth-of-type(${i + 1}) > tbody > tr:nth-child(${j}) > td:nth-child(5) > a`) //click on the blue botton for  each round in each history
                // await page.waitFor(200)
                const [newPage] = await Promise.all([
                    new Promise(resolve => page.once('popup', resolve)),
                    // page.click('a[target=_blank]'),
                ]);
                await newPage.waitFor(500)

                winNumberIncludesBye += await newPage.evaluate(() => {
                    var returnNumber = 0;

                    try {
                        for (z = 1; z <= document.querySelector("#content > div.main > div.full.nospace.martopmore > table > tbody").rows.length; z++) { // get how many rounds for that tournament
                            try {
                                if (document.querySelector(`#content > div.main > div.full.nospace.martopmore > table > tbody > tr:nth-child(${z}) > td:nth-child(6) > div`).innerText.trim() === "BYE") { // its a win, add 1 to the return number
                                    returnNumber++;
                                } else if (document.querySelector(`#content > div.main > div.full.nospace.martopmore > table > tbody > tr:nth-child(${z}) > td:nth-child(6) > div > span > .semibold`).innerText.trim() === "W") {
                                    returnNumber++;
                                }
                            }
                            catch (err) {
                                console.log(err)
                                //no pts added to the returnNumber variable
                            }
                        }
                    } catch (err) {
                        console.log(err)
                    }
                    return returnNumber;
                })

                // await console.log("winNumberIncludesBye" + winNumberIncludesBye)

                loseNumber += await newPage.evaluate(() => {
                    var returnNumber = 0;

                    try {
                        for (z = 1; z <= document.querySelector("#content > div.main > div.full.nospace.martopmore > table > tbody").rows.length; z++) { // get how many rounds for that tournament
                            try {
                                if (document.querySelector(`#content > div.main > div.full.nospace.martopmore > table > tbody > tr:nth-child(${z}) > td:nth-child(6) > div > span > .semibold`).innerText === "L") {
                                    returnNumber++;
                                }
                            }
                            catch (err) {
                                console.log(err)
                                //no pts added to the returnNumber variable
                            }
                        }
                    } catch (err) {
                        console.log(err)
                    }
                    return returnNumber;
                })

                await newPage.close()
                await page.waitFor(200)

            }
        }
    } else { // competitive history only at 1 place
        for (i = 1; i < returnData[returnData.length - 1][0]; i++) { // cycle through # of tournaments
            await page.click(`#results`) // have to click results to make page visible
            await page.waitFor(200)
            await page.click(`#content > div.main > div.results.screens > table > tbody > tr:nth-child(${i}) > td:nth-child(5) > a`) //click on the blue botton
            // await page.waitFor(200)
            const [newPage] = await Promise.all([
                new Promise(resolve => page.once('popup', resolve)),
                page.click('a[target=_blank]'),
            ]);
            await newPage.waitFor(500)

            winNumberIncludesBye += await newPage.evaluate(() => {
                var returnNumber = 0;
                try {
                    for (j = 1; j <= document.querySelector("#content > div.main > div.full.nospace.martopmore > table > tbody").rows.length
                        ; i++) {
                        if (document.querySelector(`#content > div.main > div.full.nospace.martopmore > table > tbody > tr:nth-child(${j}) > td:nth-child(6) > div`).innerText.trim() === "BYE") { // its a win, add 1 to the return number
                            returnNumber++;
                        } else if (document.querySelector(`#content > div.main > div.full.nospace.martopmore > table > tbody > tr:nth-child(${j}) > td:nth-child(6) > div > span > .semibold`).innerText.trim() === "W") {
                            returnNumber++;
                        }
                    }
                } catch (err) {
                    console.log(err)
                    // no pts added to the return number variable
                }
                return returnNumber;
            })

            // await console.log("winNumberIncludesBye" + winNumberIncludesBye)

            loseNumber += await newPage.evaluate(() => {
                var returnNumber = 0;
                try {
                    for (j = 1; j <= document.querySelector("#content > div.main > div.full.nospace.martopmore > table > tbody").rows.length
                        ; i++) {
                        if (document.querySelector(`#content > div.main > div.full.nospace.martopmore > table > tbody > tr:nth-child(${j}) > td:nth-child(6) > div > span > .semibold`).innerText === "L") {
                            returnNumber++;
                        }
                    }
                } catch (err) {
                    console.log(err)
                }
                return returnNumber;
            })

            await newPage.close()
            await page.waitFor(200)

        }
    }
    // await console.log(`WIN ${winNumberIncludesBye}`)
    // await console.log(`LOSE ${loseNumber}`)
    returnData.push([winNumberIncludesBye, loseNumber]) // in the order of win rounds (+byes) & losses
    await console.log(returnData) // need to return
    await page.waitFor(200)
    await browser.close();
    return returnData;
    // await mainWindow.webContents.send('tabAuthDataReturnIndexjsMainjs', returnData)
}

ipcMain.on('mainjsIndexjsForWikiInputOpenWindow', async (event, data) => {
    linkWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    linkWindow.loadFile('wikiInput.html')
    linkWindow.show()

    
})

ipcMain.on('wikiInputjsindexjsValue', async (event, data) => {
    console.log("received! wikiInputjsindexjsValue" + data)

    linkWindow.close()
    mainWindow.webContents.send('wikiInputIndexjsMainjs', data)

    
    // console.log(data)
   
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})