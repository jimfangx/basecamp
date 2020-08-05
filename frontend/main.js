const electron = require('electron')
const { ipcRenderer } = electron;
// let tabAuthData;

$('.tab-link').on("click", function () {
    //ipc to index.js for tablink window
    ipcRenderer.send('tabLinkWindowOpenReqMainjsIndexjs')
})

ipcRenderer.on('tabAuthDataReturnIndexjsMainjs', (event, message) => {
    console.log(`received main.js`)
    console.log(message)
    console.log(message[0])
    document.getElementById('tabLink').innerHTML = `Welcome ${message[0]}!`
    $('.tab-link').off('click');
    if (message[1].name != 'noUpcomingTournamentsBasecamp' && message[2].name != 'noCurrentTournamentsBasecamp') {
        document.getElementById('nowMuted').style.visibility = 'none'
        document.getElementById('mainTag').innerHTML = `${message[2].name}` // show current tournament first
        
    } else if (message[1].name != 'noUpcomingTournamentsBasecamp' && message[1].name === 'noCurrentTournamentsBasecamp') {
        document.getElementById('mainTag').innerHTML = `Upcoming Tournament`
    } else if (message[1].name != 'noCurrentTournamentsBasecamp' && message[1].name === 'noUpcomingTournamentsBasecamp') {
        document.getElementById('mainTag').innerHTML = `Current Tournament`
    } else if (message[1].name === 'noCurrentTournamentsBasecamp' && message[1].name === 'noUpcomingTournamentsBasecamp') {
        document.getElementById('mainTag').innerHTML = `No Tournaments`
    }
})
