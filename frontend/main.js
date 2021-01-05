const electron = require('electron');
const fs = require('fs')
const { ipcRenderer } = electron;
const superagent = require('superagent')
const config = require('./config.json')
// let tabAuthData;

$('.tab-link').on("click", function () {
    //ipc to index.js for tablink window
    ipcRenderer.send('tabroomAuthorization')

    document.getElementById('mainTag').innerHTML = 'Authorizing...'
})

ipcRenderer.on('tabroomAuthSuccessful', (event, data) => {
    console.log(`received auth from index.js`)

    // fs.writeFileSync('./auth.json', data)

    let authCredentials = require('./auth.json')

    superagent
        .get('https://tabroomapi.herokuapp.com/me')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send(JSON.parse(`{"apiauth":"${config.tabroomAPIKey}", "token":"${authCredentials.token}"}`))
        .end((err, res) => {
            console.log(res.body)
            $('#tabLink').text(`Welcome ${res.body.nameFirst} ${res.body.nameLast}`)
            $('#mainTag').text('Authorization Successful!')

            // userinfo functions
            $('.tab-link').off('click')
            $('.tab-link').on('click', function () {
                //make the request here then send the results over to plop in a window
                superagent
                    .get('https://tabroomapi.herokuapp.com/me')
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .send(JSON.parse(`{"apiauth":"${config.tabroomAPIKey}", "token":"${authCredentials.token}"}`))
                    .end((err, res) => {
                        ipcRenderer.send('userInfoWindowOpen', res.body)
                    })
            })

            // upcoming/current tournament
            //request for now tournaments, if not then exec below code
            superagent
                .get('https://tabroomapi.herokuapp.com/me/future')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send(JSON.parse(`{"apiauth":"${config.tabroomAPIKey}", "token":"${authCredentials.token}"}`))
                .end((err, res) => {

                    if (res.statusCode == 200) { // user has a future entry
                        var dateArray = []
                        var earlistElementNumber = 0
                        for (i = 0; i < res.body.length; i++) {
                            dateArray.push(Date.parse(res.body[i].date))
                        }
                        dateArray.sort((a, b) => a - b)

                        for (i = 0; i < res.body.length; i++) {
                            if (dateArray[0] === Date.parse(res.body[i].date)) {
                                earlistElementNumber = i
                            }
                        }

                        $('#mainTag').text(``).css('margin-top',"0%")
                        $('#tournamentName').html(`<a class="fs-4 text-muted" style="text-decoration: none;">Tournament:</a> ${res.body[earlistElementNumber].name}`)
                        $('#date').html(`<a class="fs-4 text-muted" style="text-decoration: none;">Date:</a> ${res.body[earlistElementNumber].date}`)
                        $('#event').html(`<a class="fs-4 text-muted" style="text-decoration: none;">Division:</a> <a href="${res.body[earlistElementNumber].eventLink}" target="_blank" style="text-decoration: underline; color:black"">${res.body[earlistElementNumber].event}</a>`)
                        $('#location').html(`<a class="fs-4 text-muted" style="text-decoration: none;">Location:</a> ${res.body[earlistElementNumber].location}`)
                        $('#status').html(`<a class="fs-4 text-muted" style="text-decoration: none;">Status:</a> ${res.body[earlistElementNumber].status}`)
                        $('#prefs').html(`<a class="fs-4 text-muted" style="text-decoration: none;">Pref Info:</a> ${res.body[earlistElementNumber].prefs}`)
                        $('#info').html(`<a class="fs-4 text-muted" style="text-decoration: none;">Additional Info:</a> ${res.body[earlistElementNumber].info}`)
                        $('#notes').html(`<a class="fs-4 text-muted" style="text-decoration: none;">Additional Notes:</a> ${res.body[earlistElementNumber].notes}`)

                        console.log(res.body[earlistElementNumber])

                    }
                    // currently working on the now tournaments thing in the api
                    // need xwiki api too
                })

        })


    // function userinfo() {

    // }

})