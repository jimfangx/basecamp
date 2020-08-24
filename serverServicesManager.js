const express = require('express')
const { response } = require('express');
var bodyParser = require('body-parser')
var app = express()
// bodyParser = require('body-parser');

// https://stackoverflow.com/questions/9177049/express-js-req-body-undefined#

// app.use(bodyParser.json());
app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }))



app.post('/', async function (req, res) {
    console.log(req.query.module)
    var module = req.query.module.toString().split(',')
    // console.log(module.length)
    var returnDataToMain = []
    for (i = 0; i < module.length; i++) {
        if (module[i] === 'judge') {
            let paradigmScrape = require('./judgeAnalysis')
            let paradigmResults = await paradigmScrape(req.body.paradigm)
            // response.setHeader('Content-Type', 'text/html');
            // console.log(paradigmResults)
            returnDataToMain.push(paradigmResults)
        }
        if (module[i] === '2nr') {
            let twoNRScrape = require('./2nrFrequencySearch')
            let twoNRResults = await twoNRScrape(req.body.wikiNeg)
            returnDataToMain.push(twoNRResults)
        }
        if (module[i] === 'speechdrop') {
            let speechdropAutocreate = require('./speechdrop')
            // console.log(req.body.speechdrop)
            let speechdropLink = await speechdropAutocreate(req.body.speechdrop)
            // while (!speechdropLink.includes('speechdrop.net')) {
            //     setTimeout(() => {
            //         // returnDataToMain.push(speechdropLink)
            //     }, 5000);
            // }
            returnDataToMain.push(speechdropLink)
        }
    }
    res.send(returnDataToMain)
})


// port = process.env.PORT;
// if (port == null || port == "") {
//     port = 8000;
// }

app.listen('8080')
console.log(`Listening at localhost:8080`)