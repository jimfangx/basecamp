const electron = require('electron')
const { ipcRenderer } = electron;

document.getElementById('tabLinkForm').onsubmit = function (e) {
    // e.preventDefault();
    console.log(document.getElementById('tabUsername').value);
    console.log(document.getElementById('tabPassword').value);

    ipcRenderer.send('tabroomAuthorizationCredentials', [document.getElementById('tabUsername').value, document.getElementById('tabPassword').value])
    return false;
}