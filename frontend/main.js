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

            $('.tab-link').off('click')
            // $('#tabLink').on('onclick', userinfo())
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
            // $('#tab-link').attr('click', "userinfo()")
        })

    superagent
        .get('https://tabroomapi.herokuapp.com/me/future')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send(JSON.parse(`{"apiauth":"${config.tabroomAPIKey}", "token":"${authCredentials.token}"}`))
        .end((err, res) => {
            //sort out future entries here - sort by date - date.parse() can take the date in the returned json, pick newest & display details. 
            // currently working on the now tournaments thing in the api
            // need xwiki api too
        })
    // function userinfo() {

    // }

})