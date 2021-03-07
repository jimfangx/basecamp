const electron = require('electron');
const fs = require('fs')
const { ipcRenderer } = electron;
const superagent = require('superagent')
const config = require('./config.json')
const authCredentials = require('./auth.json')
const polWords = require('./polWords.json');
const { resolve } = require('path');
const { rejects } = require('assert');

// wiki module
console.log(`ping`)
ipcRenderer.on('currentRoundData', async (event, data) => {
    console.log(data)


    superagent
        .post(`https://tabroomapi.herokuapp.com/me/future`)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send(JSON.parse(`{"apiauth":"${config.tabroomAPIKey}", "token":"${authCredentials.token}"}`))
        .end((err, res) => {
            // assuming this call returns 200 ok
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
            console.log(res.body[earlistElementNumber])
            superagent
                .post(`https://tabroomapi.herokuapp.com/codeExtract`)
                .set('Content-Type', 'application/x-www-form-urlencoded')
                // .send(JSON.parse(`{"apiauth":"${config.tabroomAPIKey}", "code":"${data.oppoent}", "eventLink":"${res.body[earlistElementNumber].eventLink}"}`)) // -> prod
                .send(JSON.parse(`{"apiauth":"${config.tabroomAPIKey}", "code":"${data.oppoent}", "eventLink":"${res.body[earlistElementNumber].eventLink.replace('https://www.tabroom.com', "")}"}`)) // -> dev
                .end((err, resExtract) => {
                    if (err) console.log(err)
                    console.log(resExtract.body)
                    superagent
                        .post(`https://hspolicywikiapi.herokuapp.com/getPage`)
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

                    superagent // get oppoent record @ that tournament
                        .post(`https://tabroomapi.herokuapp.com/getprelimrecord`)
                        .set('Content-Type', 'application/x-www-form-urlencoded')
                        // .send(JSON.parse(`{"apiauth":"${config.tabroomAPIKey}", "eventLink":"${res.body[earlistElementNumber].eventLink}", "code":"${data.oppoent}"}`))
                        .send(JSON.parse(`{"apiauth":"${config.tabroomAPIKey}", "eventLink":"${res.body[earlistElementNumber].eventLink.replace('https://www.tabroom.com', "")}", "code":"${data.oppoent}"}`))
                        .end((err, prelimRecordRes) => {
                            if (err) console.log(err)
                            console.log(prelimRecordRes.body)
                        })

                })
        })


    superagent
        .post(`https://tabroomapi.herokuapp.com/paradigm`)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        // .send(JSON.parse(`{"apiauth":"${config.tabroomAPIKey}", "type":"link", "link":"${data.paradigmLink}"}`))
        .send(JSON.parse(`{"apiauth":"${config.tabroomAPIKey}", "type":"link", "roundLimit":"100", "link":"${data.paradigmLink.replace('https://www.tabroom.com', "")}"}`))
        .end(async (err, paradigmRes) => {
            var result = await voteAnalysis(paradigmRes)
            console.log(result)
        })
    async function voteAnalysis(paradigmRes) {
        return new Promise((resolve, reject) => {
            console.log(paradigmRes.body)

            var dateYearAgo = new Date()
            dateYearAgo.setUTCHours(0, 0, 0)
            dateYearAgo.setFullYear(dateYearAgo.getFullYear() - 1)

            var votingAnalysis = {
                "totalAff": 0,
                "totalNeg": 0,
                "pastYearAff": 0,
                "pastYearNeg": 0,
                "totalCXRounds": 0,
                "totalCXRoundsPastYear": 0
            }

            for (i = 2; i < paradigmRes.body.length; i++) { // avoid padadigm raw text (first 2)
                if (polWords.some(v => paradigmRes.body[i].event.toLowerCase().includes(v))) {
                    if (paradigmRes.body[i].judgeVote.toLowerCase() === 'aff') {
                        if (paradigmRes.body[i].timestamp > (dateYearAgo.valueOf() / 1000)) { // valueOf() returns in ms, while tab's is in seconds
                            votingAnalysis.pastYearAff++
                            votingAnalysis.totalCXRoundsPastYear++
                        }
                        votingAnalysis.totalAff++
                        votingAnalysis.totalCXRounds++
                    }
                    if (paradigmRes.body[i].judgeVote.toLowerCase() === 'neg') {
                        if (paradigmRes.body[i].timestamp > (dateYearAgo.valueOf() / 1000)) {
                            votingAnalysis.pastYearNeg++
                            votingAnalysis.totalCXRoundsPastYear++
                        }
                        votingAnalysis.totalNeg++
                        votingAnalysis.totalCXRounds++

                    }
                }
            }
            resolve(votingAnalysis)
        })
    }

})
