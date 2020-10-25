const express = require('express')
const { response } = require('express');
var bodyParser = require('body-parser');
const scihub = require('./scihub');
var app = express()
// bodyParser = require('body-parser');

// https://stackoverflow.com/questions/9177049/express-js-req-body-undefined#

// app.use(bodyParser.json());
app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }))


function delay() {
  // `delay` returns a promise
  return new Promise(function (resolve, reject) {
    // Only `delay` is able to resolve or reject the promise
    setTimeout(function () {
      resolve(42); // After 3 seconds, resolve the promise with value 42
    }, 3000);
  });
}

// app.post('/', async function (req, res) {
// async function distributeTasksFetchResults(req, res) {

//   return new Promise((resolve, reject) => {

//     if (returnDataToMain != []) {
//       resolve(returnDataToMain)
//     } else {
//       reject(`empty!`)
//     }
//   })

// }

// while (true) {
//     if (returnDataToMain.length === module.length) {
//         res.send(returnDataToMain)
//         break;
//     }
// } 

app.post('/', async function (req, res) {

  // res.send(returnDataToMain)
  // let final = await distributeTasksFetchResults(req, res)
  // console.log("FINAL" + final)
  // res.send(final)
  console.log(req.query.module)
  var module = req.query.module.toString().split(',')
  // console.log(module.length)
  var returnDataToMain = []
  for (i = 0; i < module.length; i++) {
    if (module[i] === 'speechdrop') {
      var speechdrop = require('./speechdrop.js')
      // console.log(req.body.speechdrop)
      let speechdropLink = await speechdrop(req.body.speechdrop) //await
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
      let twoNRResults = await twoNRScrape(req.body.wiki)
      returnDataToMain.push(twoNRResults)
    }
    if (module[i] === 'judge') {
      let paradigmScrape = require('./judgeAnalysis')
      let paradigmResults = await paradigmScrape(req.body.paradigm)
      // response.setHeader('Content-Type', 'text/html');
      // console.log(paradigmResults)
      returnDataToMain.push(paradigmResults)
    }
    if (module[i] === '1ac') { // not working rn xDDD file doesnt exists rn
      let oneACScrape = require('./1acFrequencySearch')
      let oneACResults = await oneACScrape(req.body.wiki)
      returnDataToMain.push(oneACResults)
    }
    if (module[i] === 'scihub') {
      console.log(`i am in the scihub func`)
      // let sciHubModule = require('./scihub')
      // let scihubResults =  sciHubModule(req.body.scihub)
      // console.log("SCIHUB RESULTS" + scihubResults)
      // returnDataToMain.push(scihubResults)
      // .then(result => {
      //   // returnDataToMain.push(result)
      //   console.log(result)
      // }).catch(err => {
      //   console.log(`err! ${err}`)
      // })
      let sciHubModule = require('./scihub')
      let scihubResults = await sciHubModule(req.body.scihub)
      console.log(scihubResults)
      returnDataToMain.push(scihubResults)

    }

  }
  res.send(returnDataToMain)

})

// })


// port = process.env.PORT;
// if (port == null || port == "") {
//     port = 8000;
// }

app.listen('8080')
console.log(`Listening at localhost:8080`)