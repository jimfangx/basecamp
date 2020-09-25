const electron = require('electron')
const { ipcRenderer } = electron;

document.getElementById('judgeInputForm').onsubmit = function (e) {
    // e.preventDefault();
    console.log(document.getElementById('judgeInputBox').value);
    ipcRenderer.send('judgeInputjsindexjsValue', document.getElementById('judgeInputBox').value)
    return false;
}
