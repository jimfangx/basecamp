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
    computeEditInfo(data)

})

async function computeEditInfo(data) {
    console.log(data)
    var getFutureResult = await getFuture(config, authCredentials)
    console.log(getFutureResult)
    var codeExtractResult = await codeExtract(config, data, getFutureResult)
    console.log(codeExtractResult)
    var getPageResult = await getPage(codeExtractResult)
    console.log(getPageResult)
    var roundreportsResult = await roundreports(getPageResult)
    console.log(roundreportsResult)
    var getprelimrecordResults = await getprelimrecord(config, getFutureResult, data)
    console.log(getprelimrecordResults)
    var judgeAnalysisResults = await judgeAnalysis(config, data)
    console.log(judgeAnalysisResults)

    $('#tournTitle').text(getFutureResult.name)
    $('#tournDate').text(getFutureResult.date)
    $('#tournRoundNum').text(data.roundNum)

    $('#opponentEntryCode').append(codeExtractResult.code)
    $('#opponentEntry').append(codeExtractResult.entry)
    $('#opponentRecord').append(`${getprelimrecordResults.record} W`)
    $('#opponentRecordLink').attr('href', getprelimrecordResults.recordLink)

    
}


async function getFuture(config, authCredentials) {
    return new Promise((resolve, reject) => {
        superagent
            .post(`https://tabroomapi.herokuapp.com/me/future`)
            // .post(`http://localhost:8080/me/future`)
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
                resolve(res.body[earlistElementNumber])
            })
    })
}

async function codeExtract(config, data, getFutureResult) {
    return new Promise((resolve, reject) => {
        superagent
            .post(`https://tabroomapi.herokuapp.com/codeExtract`)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            // .send(JSON.parse(`{"apiauth":"${config.tabroomAPIKey}", "code":"${data.oppoent}", "eventLink":"${getFutureResult.eventLink}"}`)) // -> prod
            .send(JSON.parse(`{"apiauth":"${config.tabroomAPIKey}", "code":"${data.oppoent}", "eventLink":"${getFutureResult.eventLink.replace('https://www.tabroom.com', "")}"}`)) // -> dev
            .end((err, resExtract) => {
                if (err) console.log(err)
                resolve(resExtract.body)
            })
    })
}

async function getPage(codeExtractResult) {
    return new Promise((resolve, reject) => {
        superagent
            .post(`https://hspolicywikiapi.herokuapp.com/getPage`)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send(JSON.parse(`{"school":"${codeExtractResult.school}", "entry":"${codeExtractResult.entry}"}`))
            .end((err, wikiPageRes) => {
                if (err) console.log(err)
                resolve(wikiPageRes.text)
            })
    })
}

async function roundreports(getPageResult) {
    return new Promise((resolve, reject) => {
        superagent
            .post(`https://hspolicywikiapi.herokuapp.com/roundreports`)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send(JSON.parse(`{"link":"${getPageResult}"}`))
            .end((err, roundReportRes) => {
                if (err) console.log(err)
                resolve(roundReportRes.body)
            })
    })
}

async function getprelimrecord(config, getFutureResult, data) {
    return new Promise((resolve, reject) => {
        superagent // get oppoent record @ that tournament
            .post(`https://tabroomapi.herokuapp.com/getprelimrecord`)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            // .send(JSON.parse(`{"apiauth":"${config.tabroomAPIKey}", "eventLink":"${getFutureResult.eventLink}", "code":"${data.oppoent}"}`)) // --> prod
            .send(JSON.parse(`{"apiauth":"${config.tabroomAPIKey}", "eventLink":"${getFutureResult.eventLink.replace('https://www.tabroom.com', "")}", "code":"${data.oppoent}"}`)) // --> dev
            .end((err, prelimRecordRes) => {
                if (err) console.log(err)
                resolve(prelimRecordRes.body)
            })
    })
}


async function judgeAnalysis(config, data) {
    return new Promise((resolve, reject) => {
        superagent
            .post(`https://tabroomapi.herokuapp.com/paradigm`)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            // .send(JSON.parse(`{"apiauth":"${config.tabroomAPIKey}", "type":"link", "roundLimit":"100", "link":"${data.paradigmLink}"}`)) // --> prod
            .send(JSON.parse(`{"apiauth":"${config.tabroomAPIKey}", "type":"link", "roundLimit":"100", "link":"${data.paradigmLink.replace('https://www.tabroom.com', "")}"}`)) // --> dev
            .end(async (err, paradigmRes) => {
                var result = await voteAnalysis(paradigmRes)
                resolve(result)
            })
    })
}


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