// const superagent = require('superagent')
// const { http, https } = require('follow-redirects');
const HTMLtoDOCX = require('html-to-docx');
var fs = require('fs');
const puppeteer = require('puppeteer');
// var orignalArticle = "https://theintercept.com/2019/12/20/mit-ethical-ai-artificial-intelligence/"

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(`https://outline.com/https://theintercept.com/2019/12/20/mit-ethical-ai-artificial-intelligence/`);
    await page.waitFor(500);
    // await page.waitForNavigation()
    var pageURL = page.url()
    console.log(pageURL)
    await page.waitFor(2000);
    var htmlString = await page.evaluate(() => {
        var returnData = document.querySelector("body > outline-app > outline-article > div.article-wrapper > div > raw").innerHTML
        return returnData
    })
    await page.waitFor(2000);
    var docxBuffer = await HTMLtoDOCX(htmlString);
    fs.writeFile('outline.docx', docxBuffer, function (err) {
        if (err) return console.log(err);
        console.log('done');
    })
    await browser.close()

    // return (pageURL)
    //  in servermanageere - send docx file and delete
})()

