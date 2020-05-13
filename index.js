const cheerio = require('cheerio')
const request = require('request')
request(`https://hspolicy.debatecoaches.org/Archbishop%20Mitty/Patwa-Aggarwal%20Neg`, (err,res,html)=> {
    const $ = cheerio.load(html)
    console.log($("#tblReports tr").eq(1).text())
})
