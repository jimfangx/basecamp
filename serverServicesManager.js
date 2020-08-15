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
    // console.log(req.body.paradigm)
    let paradigmScrape = require('./judgeAnalysis')
    let paradigmResults = await paradigmScrape(req.body.paradigm)
    // response.setHeader('Content-Type', 'text/html');
    console.log(paradigmResults)
    res.send(paradigmResults)
})


// port = process.env.PORT;
// if (port == null || port == "") {
//     port = 8000;
// }

app.listen('8080')
console.log(`Listening at localhost:8080`)