const electron = require('electron')
const { ipcRenderer } = electron;

document.getElementById('speechdropInputForm').onsubmit = function (e) {
    // e.preventDefault();
    console.log(document.getElementById('speechdropInputBox').value);
    ipcRenderer.send('speechdropInputjsindexjsValue', document.getElementById('speechdropInputBox').value)
    return false;
}
