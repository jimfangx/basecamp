
const superagent = require('superagent');
const querystring = require('querystring');
var scholar = require('google-scholar-link')
const { http, https } = require('follow-redirects');
var scholarLink = ""

let returnObj = {
    sourceType: "",
    download: "",
    mirror: "",
    indexPage: ""
}

// var scihubLink = "https://doi.org/10.1016/j.spacepol.2018.12.004"
// var scihubLink = "https://doi.org/10.1093/oxfordhb/9780199925513.013.30"
// var scihubLink = "https://www.igi-global.com/chapter/the-fundamentals-of-digital-forensics-and-cyber-law/251418"

module.exports = async function (scihubLink) {
    // let returnObj = {
    //     sourceType: "",
    //     download: "",
    //     mirror: "",
    //     indexPage: ""
    // }
    return new Promise((resolve, reject) => {
        try {
            superagent
                .get(`https://sci-hub.se/${scihubLink}`)
                .set("Cache-Control", "no-cache")
                .set('User-Agent', "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36")
                .set("Accept", "*/*")
                .set("Accept-Encoding", "gzip, deflate, br")
                .set("Connection", "keep-alive")
                .set("Host", "sci-hub.se")
                .end((err, res) => {

                    var found = res.text.match(/<iframe src = \"(.*?)\" id = \"pdf\"><\/iframe>/)

                    if (found === null) {
                        if (res.text.includes('libgen')) { // libgen download
                            var libgenSection = res.text.substring(res.text.indexOf('<td colspan=2>') + 14, res.text.indexOf('</a></b></td>'))
                            libgenSection = libgenSection.substring(libgenSection.indexOf(`<b><a href='`) + 12, libgenSection.indexOf(`'>`))
                            const request = https.request({
                                host: 'sci-hub.se',
                                path: scihubLink,
                                headers: {
                                    "Cache-Control": "no-cache",
                                    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36",
                                    "Accept": "*/*",
                                    "Accept-Encoding": "gzip, deflate, br",
                                    "Connection": "keep-alive"
                                }
                            }, response => {
                                console.log(response.responseUrl);
                                returnObj.sourceType = "libgen"
                                returnObj.indexPage = response.responseUrl
                                console.log(`Document on libgen - Mirror selection page: ${response.responseUrl}`)
                                returnObj.download = response.responseUrl
                                console.log(`Working Download Mirror Link: ${libgenSection}`)
                                returnObj.mirror = libgenSection
                                resolve(returnObj)
                            });
                            request.end();
                            // console.log(`Working Download Mirror Link: ${libgenSection}`)
                            // returnObj.mirror = libgenSection
                            // resolve(returnObj)
                        } else if (scihubLink.includes('doi.org')) {
                            const doiRequest = https.request({
                                host: 'doi.org',
                                path: scihubLink.substring(15)
                            }, response => {
                                // console.log(response.responseUrl);
                                superagent
                                    .get(`https://sci-hub.se/${response.responseUrl}`)
                                    .set("Cache-Control", "no-cache")
                                    .set('User-Agent', "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36")
                                    .set("Accept", "*/*")
                                    .set("Accept-Encoding", "gzip, deflate, br")
                                    .set("Connection", "keep-alive")
                                    .set("Host", "sci-hub.se")
                                    .end((err, res) => {
                                        found = res.text.match(/<iframe src = \"(.*?)\" id = \"pdf\"><\/iframe>/)
                                        if (found === null) {
                                            if (res.text.includes('libgen')) { // libgen download
                                                var libgenSection = res.text.substring(res.text.indexOf('<td colspan=2>') + 14, res.text.indexOf('</a></b></td>'))
                                                libgenSection = libgenSection.substring(libgenSection.indexOf(`<b><a href='`) + 12, libgenSection.indexOf(`'>`))
                                                const request = https.request({
                                                    host: 'sci-hub.se',
                                                    path: scihubLink,
                                                }, response => {
                                                    console.log(response.responseUrl);
                                                    returnObj.sourceType = "libgen"
                                                    returnObj.indexPage = response.responseUrl
                                                    console.log(`Document on libgen - Mirror selection page: ${response.responseUrl}`)
                                                    returnObj.download = response.responseUrl
                                                    console.log(`Working Download Mirror Link: ${libgenSection}`)
                                                    returnObj.mirror = libgenSection
                                                    resolve(returnObj)
                                                });
                                                request.end();
                                                // console.log(`Working Download Mirror Link: ${libgenSection}`)
                                                // returnObj.mirror = libgenSection
                                                // resolve(returnObj)
                                            } else {
                                                // message.reply(`Not found on Sci-Hub! :( Try the following Google Scholar link (Incase they have a free PDF)`)
                                                // scholarLink = scholar(querystring.escape(scihubLink))
                                                // scholarLink = scholarLink.substring(0, scholarLink.length - 1)
                                                // scholarLink = scholarLink.substring(0, scholarLink.indexOf('"')) + scholarLink.substring(scholarLink.indexOf('"') + 1)
                                                // message.channel.send(scholarLink)
                                                var doiNoHTTPS = scihubLink
                                                if (scihubLink.includes('doi.org')) {
                                                    if (scihubLink.includes('https')) {
                                                        doiNoHTTPS = doiNoHTTPS.replace('https://doi.org/', '')
                                                    } else if (scihubLink.includes('http')) {
                                                        doiNoHTTPS = doiNoHTTPS.replace('http://doi.org/', '')
                                                    }
                                                }
                                                scholarLink = scholar(querystring.escape(doiNoHTTPS))
                                                superagent
                                                    .get(scholarLink)
                                                    .end((err, res) => {
                                                        if (res.text.includes('gs_ggs gs_fl')) {
                                                            var htmlForFiltering = res.text.substring(res.text.indexOf('gs_ggs gs_fl'), res.text.indexOf('<div class="gs_ri">'))
                                                            console.log(htmlForFiltering.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/)[0])
                                                            returnObj.sourceType = "scholar"
                                                            returnObj.download = htmlForFiltering.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/)[0]
                                                            resolve(returnObj)
                                                        }
                                                    })

                                            }
                                        } else {
                                            if (found[1].indexOf("https") === -1) {
                                                found[1] = "https:" + found[1];
                                            }
                                            try {
                                                // console.log(found[1])
                                                returnObj.sourceType = "scihub"
                                                returnObj.download = found[1]
                                                console.log(returnObj.download)
                                                resolve(returnObj)
                                                // console.log({
                                                //     files: [found[1] + ".pdf"]
                                                // }).catch(err => console.log(err))
                                            } catch (e) {
                                                console.log(e)
                                            }
                                        }
                                    })
                            });
                            doiRequest.end();
                        } else {

                            // if (scihubLink.includes('https://doi.org/')) {
                            //     var scholarSearchTerm = scihubLink.replace('https://doi.org/', '')
                            //     scholarLink = scholar(querystring.escape(scholarSearchTerm))
                            //     console.log(scholarLink)
                            //     superagent
                            //     .get(scholarLink)
                            //     .end(req, res) {

                            //     }
                            // } 
                            // scholarLink = scholar(querystring.escape(scihubLink))
                            // scholarLink = scholarLink.substring(0, scholarLink.length - 1)
                            // scholarLink = scholarLink.substring(0, scholarLink.indexOf('"')) + scholarLink.substring(scholarLink.indexOf('"') + 1)
                            // message.channel.send(scholarLink)

                            superagent
                                .get(scihubLink)
                                .end((err, res) => {
                                    var doi = ""
                                    try {
                                        // if current regex is buggy all of them are here https://stackoverflow.com/questions/27910/finding-a-doi-in-a-document-or-page
                                        // escape / : https://stackoverflow.com/questions/16657152/matching-a-forward-slash-with-a-regex
                                        doi = res.text.match(/\b(10[.][0-9]{4,}(?:[.][0-9]+)*\/(?:(?!["&\'<>])\S)+)\b/g) // doi hopefully found
                                        // console.log(doi)
                                        if (doi != null) {
                                            scholarLink = scholar(querystring.escape(doi))
                                            superagent
                                                .get(scholarLink)
                                                .end((err, res) => {
                                                    if (res.text.includes('gs_ggs gs_fl')) {
                                                        var htmlForFiltering = res.text.substring(res.text.indexOf('gs_ggs gs_fl'), res.text.indexOf('<div class="gs_ri">'))
                                                        console.log(htmlForFiltering.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/)[0])
                                                        returnObj.sourceType = "scholar"
                                                        returnObj.download = htmlForFiltering.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/)[0]
                                                        resolve(returnObj)
                                                    }
                                                })
                                        } else {
                                            console.log(`Not Found :(`)
                                        }
                                    } catch (err) {

                                    }
                                })
                        }

                    } else {
                        if (found[1].indexOf("https") === -1) {
                            found[1] = "https:" + found[1];
                        }
                        try {
                            // console.log(found[1])
                            returnObj.sourceType = "scihub"
                            returnObj.download = found[1]
                            console.log(returnObj.download)
                            resolve(returnObj)
                            // console.log({
                            //     files: [found[1] + ".pdf"]
                            // }).catch(err => console.log(err))
                        } catch (e) {
                            console.log(e)
                        }
                    }
                })

        } catch (err) {
            reject(err)
        }

        // console.log("RETURN" + returnObj)
        // console.log("RETURN" + returnObj.download)
        // console.log("RETURN" + returnObj.indexPage)
        // console.log("RETURN" + returnObj.mirror)
        // console.log("RETURN" + returnObj.sourceType)
        // resolve(returnObj)
    })
}