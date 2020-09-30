const electron = require('electron')
const { ipcRenderer } = electron;

document.getElementById('scihubInputForm').onsubmit = function (e) {
    // e.preventDefault();
    console.log(document.getElementById('scihubInputBox').value);
    ipcRenderer.send('scihubInputjsindexjsValue', document.getElementById('scihubInputBox').value)
    return false;
}
