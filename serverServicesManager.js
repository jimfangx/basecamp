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


function delay() {
    // `delay` returns a promise
    return new Promise(function(resolve, reject) {
      // Only `delay` is able to resolve or reject the promise
      setTimeout(function() {
        resolve(42); // After 3 seconds, resolve the promise with value 42
      }, 3000);
    });
  }

app.post('/', async function (req, res) {
    console.log(req.query.module)
    var module = req.query.module.toString().split(',')
    // console.log(module.length)
    var returnDataToMain = []
    for (i = 0; i < module.length; i++) {
        if (module[i] === 'speechdrop') {
            var speechdrop = require('./speechdrop.js')
            // console.log(req.body.speechdrop)
            let speechdropLink = await speechdrop(req.body.speechdrop)
            // await delay();
            returnDataToMain.push(speechdropLink)
            // console.log(req.body.speechdrop)
            // while (!speechdropLink.includes('speechdrop.net')) {
            // setTimeout(() => {
            //     returnDataToMain.push(speechdropLink)
            // }, 5000);
            // }
            
        }
        if (module[i] === '2nr') {
            let twoNRScrape = require('./2nrFrequencySearch')
            let twoNRResults = await twoNRScrape(req.body.wikiNeg)
            returnDataToMain.push(twoNRResults)
        }
        if (module[i] === 'judge') {
            let paradigmScrape = require('./judgeAnalysis')
            let paradigmResults = await paradigmScrape(req.body.paradigm)
            // response.setHeader('Content-Type', 'text/html');
            // console.log(paradigmResults)
            returnDataToMain.push(paradigmResults)
        }

    }
    // while (true) {
    //     if (returnDataToMain.length === module.length) {
    //         res.send(returnDataToMain)
    //         break;
    //     }
    // } 
    res.send(returnDataToMain)
})


// port = process.env.PORT;
// if (port == null || port == "") {
//     port = 8000;
// }

app.listen('8080')
console.log(`Listening at localhost:8080`)