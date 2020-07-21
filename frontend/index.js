const electron = require('electron')
const { app, BrowserWindow, ipcMain, Menu, ClientRequest, session, powerSaveBlocker, globalShortcut } = electron;
let mainWindow;
let authWindow;
const puppeteer = require('puppeteer');


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
    console.log(data)
    authWindow.close()
    getUpcomingTournamentData()
    // no api ugh. :( web scraping ensues with https://learnscraping.com/nodejs-web-scraping-with-puppeteer/
})

async function getUpcomingTournamentData() {
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null})
    const page = await browser.newPage();
    await page.goto(`https://www.tabroom.com/index/index.mhtml`)
    await page.waitFor(500);
    await page.click(`#toprow > span.login > a`)
}



// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})