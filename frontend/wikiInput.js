const electron = require('electron')
const { ipcRenderer } = electron;

document.getElementById('wikiInputForm').onsubmit = function (e) {
    // e.preventDefault();
    console.log(document.getElementById('wikiInputBox').value);
    ipcRenderer.send('wikiInputjsindexjsValue', document.getElementById('wikiInputBox').value)
    return false;
}
