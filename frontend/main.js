const electron = require('electron')
const { ipcRenderer } = electron;
// let tabAuthData;

$('.tab-link').on("click", function () {
    //ipc to index.js for tablink window
    ipcRenderer.send('tabLinkWindowOpenReqMainjsIndexjs')

    document.getElementById('mainTag').innerHTML = 'Authorizing...'
})

ipcRenderer.on('tabAuthDataReturnIndexjsMainjs', (event, message) => {
    console.log(`received main.js`)
    console.log(message)
    console.log(message[0])
    document.getElementById('tabLink').innerHTML = `Welcome ${message[0]}!`
    var autoProcessing = true
    $('.tab-link').off('click');
    if (message[1].name != 'noUpcomingTournamentsBasecamp' && message[2].name != 'noCurrentTournamentsBasecamp') {
        document.getElementById('mainTag').innerHTML = `<small class="text-muted" id="mutedHelperText">Now: </small>${message[2].name} - ${message[2].side}` // show current tournament first
        document.getElementById('oppoent').innerHTML = `<small class="text-muted" id="mutedHelperText">Oppoent: </small>${message[2].oppoent}`
        document.getElementById('judge').innerHTML = `<small class="text-muted" id="mutedHelperText">Judge: </small><a href="${message[2].paradigmLink}" class="text-decoration-none" style="color: black;">${message[2].judge}</a>`
        document.getElementById('room').innerHTML = `<small class="text-muted" id="mutedHelperText">Room: </small>${message[2].room}`
        document.getElementById('datesAndStartTimes').innerHTML = `<small class="text-muted" id="mutedHelperText">Start Time: </small>${message[2].start}`
        document.getElementById('eventAndRound').innerHTML = `<small class="text-muted" id="mutedHelperText">Round: </small>${message[2].round}`

        autoProcessing = true; //doing this to reduce lag/delay in processing due to waiting for the promise to resolve here for the k/d
    } else if (message[1].name != 'noUpcomingTournamentsBasecamp' && message[2].name === 'noCurrentTournamentsBasecamp') { // upcoming tournament
        document.getElementById('mainTag').innerHTML = `<small class="text-muted" id="mutedHelperText">Upcoming: </small>${message[1].name} - ${message[1].status}`
        document.getElementById('datesAndStartTimes').innerHTML = `<small class="text-muted" id="mutedHelperText">Tournament Start: </small> ${message[1].date}`
        document.getElementById('eventAndRound').innerHTML = `<small class="text-muted" id="mutedHelperText">Event: </small> ${message[1].event}`
    } else if (message[1].name != 'noUpcomingTournamentsBasecamp' && message[2].name === 'noCurrentTournamentsBasecamp') { // current tournament, no upcoming
        document.getElementById('mainTag').innerHTML = `<small class="text-muted" id="mutedHelperText">Now: </small>${message[2].name} - ${message[2].side}`
    } else if (message[1].name === 'noUpcomingTournamentsBasecamp' && message[2].name === 'noCurrentTournamentsBasecamp') {
        document.getElementById('mainTag').innerHTML = `No Tournaments`
    }

    var tournAttended = 0;
    for (i = 0; i < message[3].length; i++) {
        tournAttended += message[3][i]
    }
    $('#TournAndStatsDiv').css('visibility', 'visible')
    $('#numberOfTournaments').html(`<small class="text-muted" id="mutedHelperText">Total # of Tournaments: </small>${tournAttended}`)
    $('#kd').html(`<small class="text-muted" id="mutedHelperText">KD Ratio: </small>${message[4][0]} Wins/${message[4][1]} Losses - KD: ${Math.ceil((message[4][0] / message[4][1]) * 100) / 100}`)

    if (autoProcessing) { // for auto processing
        var modules = 'judge,speechdrop'
        var settings = {
            "url": `http://localhost:8080/?module=${modules}`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            "data": {
                "paradigm": `https://www.tabroom.com/index/paradigm.mhtml?judge_person_id=88574`,
                "speechdrop": `BasecampVG-VS-BasecampJF-TEST`
                // `${message[2].paradigmLink}`
            }
        };

        $.ajax(settings).done(function (response) {
            console.log(response);
        });
    }
})


// manual processing
$('.2nrSearch').on('click', function () {
    console.log(`2nrClick`)
})

$('.1acSearch').on('click', function() {

})

$('.1acSearch').on('click', function() {

})