const electron = require('electron')
const { ipcRenderer } = electron;






ipcRenderer.on('moduleNotification', (event, message) => {
    console.log(message)
    document.getElementById('input').onsubmit = function (e) {
        // e.preventDefault();
        var sendData = []
        sendData.push(document.getElementById('inputBox').value)
        sendData.push(message)
        console.log(document.getElementById('inputBox').value);
        console.log(message);
        ipcRenderer.send('InputjsindexjsValue', sendData) // this includes the input data & the module
        return false;
    }
})




// document.getElementById('input').onsubmit = function (e) {
//     // e.preventDefault();
//     console.log(document.getElementById('inputBox').value);
//     ipcRenderer.send('InputjsindexjsValue', document.getElementById('inputBox').value)
//     return false;
// }
