const { rejects } = require('assert');
const { promises } = require('dns');
const electron = require('electron')
const { app, BrowserWindow, ipcMain, Menu, ClientRequest, session, powerSaveBlocker, globalShortcut } = electron;
const fs = require('fs')
const superagent = require('superagent');
const config = require('./config.json')


let mainWindow;
let authWindow;
let tournamentStartWindow; // 1 key perform all calcs when new pairings go live
let inputWindow; // input for the individual functions not used during a tournament start
let userinfoWindow; // userinfo window (when clicked on the logged in name)

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

    /**
     * Dev stuff
     */
    mainWindow.webContents.openDevTools() // dev tools

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

});

ipcMain.on('tabroomAuthorization', (event) => { // tabroom authorization
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

ipcMain.on('tabroomAuthorizationCredentials', async (event, data) => {
    console.log('received!')
    // console.log(data)

    authWindow.close()

    writeSend(data)
    async function writeSend() {
        var token = await apiCall(data)
        console.log(token)
        fs.writeFile('./auth.json', JSON.stringify(token), function (err) {
            if (err) return console.log(err)
            console.log(`written`)
            mainWindow.webContents.send('tabroomAuthSuccessful', token)
        })
    }

    async function apiCall(data) {
        return new Promise((resolve, reject) => {
            superagent
                .post('https://tabroomapi.herokuapp.com/login')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send(JSON.parse(`{"apiauth":"${config.tabroomAPIKey}", "username":"${data[0]}", "password":"${data[1]}"}`))
                .end((err, res) => {
                    resolve(res.body)
                    console.log('test')
                })
        })
    }


})

ipcMain.on('userInfoWindowOpen', (event, data) => {
    console.log(`received user info`)
    userinfoWindow = new BrowserWindow({
        width: 400,
        height: 600,
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    userinfoWindow.loadFile('userinfo.html')
    userinfoWindow.show()

    console.log(data)

    // send the signal & userinfo data to the userinfo.js & userinfo.html for loading
    userinfoWindow.webContents.on('did-finish-load', function () {
        userinfoWindow.webContents.send('userInfoLoadData', data)
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})
