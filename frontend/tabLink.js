const electron = require('electron')
const { ipcRenderer } = electron;


// document.getElementById('tabLinkForm').addEventListener("submit", function (e) {
//     debugger;
//     var form = document.getElementById('tabLinkForm');

//     // form.onsubmit = function (e) {
//     e.preventDefault();

//     var data = {};
//     for (var i = 0, ii = form.length; i < ii; ++i) {
//         var input = form[i];
//         if (input.value.length > 100) { // sanitize input
//             alert(`Input too long`)
//         }
//         else if (input.name) {
//             data[input.name] = input.value;
//         }
//     }

//     // ipcRenderer.send('tabroom.comCredentialstabLinkjsindexjs', JSON.stringify(data))
//     console.log(JSON.stringify(data))
//     // }
// })


// function submitForm() {
//     var form = document.getElementById('tabLinkForm');

//     // form.onsubmit = function (e) {
//     // e.preventDefault();

//     var data = {};
//     for (var i = 0, ii = form.length; i < ii; ++i) {
//         var input = form[i];
//         if (input.value.length > 100) { // sanitize input
//             alert(`Input too long`)
//         }
//         else if (input.name) {
//             data[input.name] = input.value;
//         }
//     }

//     // ipcRenderer.send('tabroom.comCredentialstabLinkjsindexjs', JSON.stringify(data))
//     console.log(JSON.stringify(data))
// }

document.getElementById('tabLinkForm').onsubmit = function (e) {
    // e.preventDefault();
    console.log(document.getElementById('tabUsername').value);
    console.log(document.getElementById('tabPassword').value);
    ipcRenderer.send('tabroom.comCredentialstabLinkjsindexjs', [document.getElementById('tabUsername').value, document.getElementById('tabPassword').value])
    return false;
}