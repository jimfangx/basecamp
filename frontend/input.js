const electron = require('electron')
const { ipcRenderer } = electron;

document.getElementById('input').onsubmit = function (e) {
    // e.preventDefault();
    console.log(document.getElementById('inputBox').value);
    ipcRenderer.send('scihubInputjsindexjsValue', document.getElementById('inputBox').value)
    return false;
}
