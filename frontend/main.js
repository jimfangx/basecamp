const electron = require('electron')
const { ipcRenderer } = electron;
// let tabAuthData;

$('.tab-link').on("click", function () {
    //ipc to index.js for tablink window
    ipcRenderer.send('tabroomAuthorization')

    document.getElementById('mainTag').innerHTML = 'Authorizing...'
})