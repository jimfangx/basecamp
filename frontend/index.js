const electron = require('electron')
const { app, BrowserWindow, ipcMain, Menu, ClientRequest, session, powerSaveBlocker, globalShortcut } = electron;
let mainWindow;
let authWindow;
const puppeteer = require('puppeteer');
const fs = require('fs')


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

ipcMain.on('tabroom.comCredentialstabLinkjsindexjs', (event, data) => {
    console.log("received!")
    // console.log(data)
    fs.writeFileSync('./tabCred.json', data);
    authWindow.close()
    getUpcomingTournamentData(data)
    // no api ugh. :( web scraping ensues with https://learnscraping.com/nodejs-web-scraping-with-puppeteer/
})

async function getUpcomingTournamentData(data) {
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null })
    const page = await browser.newPage();
    await page.goto(`https://www.tabroom.com/index/index.mhtml`)
    // await page.addScriptTag({ url: 'https://code.jquery.com/jquery-3.2.1.min.js' })
    await page.waitFor(500);
    await page.click(`#toprow > span.login > a`)
    await page.type(`#user\\a \\9 \\9 \\9 \\9 \\9 name`, data[0])
    await page.waitFor(200);
    await page.type(`#password`, data[1])
    await page.waitFor(200);
    await page.click(`#login-box > form > fieldset > input`)
    var returnData = await page.evaluate(() => {
        var evaluateCombinationData = []
        evaluateCombinationData.push(document.querySelector("#content > div.main > span.threefifths.nospace > h3").innerText) //  name
        // upcoming
        var upcomingTournObj = {
            name: "",
            date: "",
            event: "",
            status: ""
        }
        try {
            upcomingTournObj.name = document.querySelector("div.nowrap:nth-child(1)").innerText
            // evaluateCombinationData.push(document.querySelector("div.nowrap:nth-child(1)").innerText)
        } catch (err) {
            console.log(err)
            upcomingTournObj.name = 'noUpcomingTournamentsBasecamp'
            evaluateCombinationData.push(upcomingTournObj)
            // evaluateCombinationData.push(`noUpcoming`)
        }
        if (evaluateCombinationData[1].name != `noUpcomingTournamentsBasecamp`) {//there is a scheduled tourn, get date & status
            upcomingTournObj.date = document.querySelector("#upcoming > tbody > tr:nth-child(1) > td:nth-child(2)").innerText
            upcomingTournObj.event = document.querySelector("#upcoming > tbody > tr:nth-child(1) > td:nth-child(3)").innerText
            upcomingTournObj.status = document.querySelector("#upcoming > tbody > tr:nth-child(1) > td:nth-child(5)").innerText
            evaluateCombinationData.push(upcomingTournObj)
        }

        // current - if has current dont show the upcoming. check info box for links, if found, find a way to beam to phone
        var currentTournObj = {
            name: "",
            round: "",
            date: "",
            event: "",
            status: ""
        }
        try {
            currentTournObj.name = document.querySelector("#content > div.main > div.screens.current > div.full.nospace.marbottommore.padtopmore.padbottom.ltborderbottom > span.threefifths.nospace > h5").innerText
        } catch (err) {
            console.log(err)
            currentTournObj.name = 'noCurrentTournamentsBasecamp'
            evaluateCombinationData.push(currentTournObj)
        } 
        if (evaluateCombinationData[2].name != 'noCurrentTournamentsBasecamp') {
            upcomingTournObj.round = 
        }
        return evaluateCombinationData;
    })
    // returnData.push(await page.evaluate(page.querySelector("#content > div.main > span.threefifths.nospace > h3").innerText))
    await console.log(returnData)
    //return name, recent competition data if needed
}



// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})