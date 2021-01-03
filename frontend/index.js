const electron = require('electron')
const { app, BrowserWindow, ipcMain, Menu, ClientRequest, session, powerSaveBlocker, globalShortcut } = electron;
const fs = require('fs')
const superagent = require('superagent');
const config = require('./config.json')


let mainWindow;
let authWindow;
let tournamentStartWindow; // 1 key perform all calcs when new pairings go live
let inputWindow; // input for the individual functions not used during a tournament start

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

ipcMain.on('tabroomAuthorizationCredentials', (event, data) => {
    console.log('received!')
    console.log(data)

    authWindow.close()

    superagent
        .post('https://tabroomapi.herokuapp.com/login')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send(JSON.parse(`{"apiauth":"${config.tabroomAPIKey}", "username":"${data[0]}", "password":"${data[1]}"}`))
        .end((err, res) => {
            console.log(res.body)
        })
    
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})
