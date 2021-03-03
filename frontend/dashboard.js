const electron = require('electron');
const fs = require('fs')
const { ipcRenderer } = electron;
const superagent = require('superagent')
const config = require('./config.json')
const authCredentials = require('./auth.json')

// wiki module
console.log(`ping`)
ipcRenderer.on('currentRoundData', (event, data) => {
    console.log(data)
    superagent
        .post(`https://tabroomapi.herokuapp.com/me/future`)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send(JSON.parse(`{"apiauth":"${config.tabroomAPIKey}", "token":"${authCredentials.token}"}`))
        .end((err, res) => {
            var dateArray = []
            var earlistElementNumber = 0
            for (i = 0; i < res.body.length; i++) {
                dateArray.push(Date.parse(res.body[i].date))
            }
            dateArray.sort((a, b) => a - b)
            // for (i = 0; i < dateArray.length; i++) {
            //     if ((Date.now() - (2.5*60*60*1000)) > dateArray[i]) { // add 2 hours so that it still displays in round
            //         dateArray = dateArray.slice(1)
            //     }
            // }
            for (i = 0; i < res.body.length; i++) {
                if (dateArray[0] === Date.parse(res.body[i].date)) {
                    earlistElementNumber = i
                }
            }
            console.log(res.body[earlistElementNumber].eventLink)
            superagent
                .post(`https://tabroomapi.herokuapp.com/codeExtract`)
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send(JSON.parse(`{"apiauth":"${config.tabroomAPIKey}", "code":"${data.oppoent}", "eventLink":"${res.body[earlistElementNumber].eventLink}"}`))
                .end((err, resExtract) => {
                    if (err) console.log(err)
                    console.log(resExtract.body)
                    superagent
                        .post(`https://hspolicywikiapi.herokuapp.com/getpage`)
                        .set('Content-Type', 'application/x-www-form-urlencoded')
                        .send(JSON.parse(`{"school":"${resExtract.body.school}", "entry":"${resExtract.body.entry}"}`))
                        .end((err, wikiPageRes) => {
                            if (err) console.log(err)
                            console.log(wikiPageRes.text)
                            superagent
                                .post(`https://hspolicywikiapi.herokuapp.com/roundreports`)
                                .set('Content-Type', 'application/x-www-form-urlencoded')
                                .send(JSON.parse(`{"link":"${wikiPageRes.text}"}`))
                                .end((err, roundReportRes) => {
                                    if (err) console.log(err)
                                    console.log(roundReportRes.body)
                                })
                        })
                })
        })

})
