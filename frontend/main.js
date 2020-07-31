const electron = require('electron')
const { ipcRenderer } = electron;

$('.tab-link').on("click", function () {
    //ipc to index.js for tablink window
    ipcRenderer.send('tabLinkWindowOpenReqMainjsIndexjs')
})

ipcRenderer.on('tabAuthDataReturnIndexjsMainjs', (event, message) => {
    console.log(`received main.js`)
    console.log(message)
})