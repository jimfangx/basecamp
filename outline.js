// const superagent = require('superagent')
// const { http, https } = require('follow-redirects');
const HTMLtoDOCX = require('html-to-docx')
var fs = require('fs');
const puppeteer = require('puppeteer');
// var orignalArticle = "https://theintercept.com/2019/12/20/mit-ethical-ai-artificial-intelligence/"

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(`https://outline.com/https://theintercept.com/2019/12/20/mit-ethical-ai-artificial-intelligence/`);
    // await page.waitFor(300);
    await page.waitForNavigation()
    var pageURL = page.url()
    var htmlString = await page.evaluate(() => {
        return (document.querySelector("body > outline-app > outline-article > div.article-wrapper > div > raw"))
    })
    var docxBuffer = await HTMLtoDOCX(htmlString)
    fs.writeFile('outline.docx', docxBuffer, function (err) {
        if (err) return console.log(err);
        console.log('done');
    })
    await browser.close()

    // return (pageURL)
    //  in servermanageere - send docx file and delete
})

// var getLink = `https://outline.com/${orignalArticle}`

// const outlineRequest = https.request({
//     host: 'outline.com',
//     path: orignalArticle,
// }, response => {
//     console.log(response.responseUrl);
//     superagent
//         .get(response.responseUrl)
//         .end((err, res) => {
//             // const htmlString = res.text.substring(res.text.indexOf("<raw content="), res.text.indexOf('" dir="ltr">'));
//             console.log(res.text)
//         }) 
// });
// outlineRequest.end();
// (async () => {
//     var docxBuffer = await HTMLtoDOCX(htmlString)
//     fs.writeFile('outline.docx', docxBuffer, function (err) {
//         if (err) return console.log(err);
//         console.log('done');
//     })
// })