
const superagent = require('superagent');
const querystring = require('querystring');
var scholar = require('google-scholar-link')
const { http, https } = require('follow-redirects');
var scholarLink = ""
// var originalLink = "https://doi.org/10.7765/9781526123138.00022"
var originalLink = "https://www.igi-global.com/chapter/the-fundamentals-of-digital-forensics-and-cyber-law/251418"

superagent
    .get(`https://sci-hub.tw/${originalLink}`)
    .end((err, res) => {

        var found = res.text.match(/<iframe src = \"(.*?)\" id = \"pdf\"><\/iframe>/)

        if (found === null) {
            if (res.text.includes('libgen')) { // libgen download
                var libgenSection = res.text.substring(res.text.indexOf('<td colspan=2>') + 14, res.text.indexOf('</a></b></td>'))
                libgenSection = libgenSection.substring(libgenSection.indexOf(`<b><a href='`) + 12, libgenSection.indexOf(`'>`))
                const request = https.request({
                    host: 'sci-hub.tw',
                    path: originalLink,
                }, response => {
                    console.log(response.responseUrl);
                    console.log(`Document on libgen - Mirror selection page: ${response.responseUrl}`)
                });
                request.end();
                console.log(`Working Download Mirror Link: ${libgenSection}`)
            } else if (originalLink.includes('doi.org')) {
                const doiRequest = https.request({
                    host: 'doi.org',
                    path: originalLink.substring(15)
                }, response => {
                    // console.log(response.responseUrl);
                    superagent
                        .get(`https://sci-hub.tw/${response.responseUrl}`)
                        .end((err, res) => {
                            found = res.text.match(/<iframe src = \"(.*?)\" id = \"pdf\"><\/iframe>/)
                            if (found === null) {
                                if (res.text.includes('libgen')) { // libgen download
                                    var libgenSection = res.text.substring(res.text.indexOf('<td colspan=2>') + 14, res.text.indexOf('</a></b></td>'))
                                    libgenSection = libgenSection.substring(libgenSection.indexOf(`<b><a href='`) + 12, libgenSection.indexOf(`'>`))
                                    const request = https.request({
                                        host: 'sci-hub.tw',
                                        path: originalLink,
                                    }, response => {
                                        console.log(response.responseUrl);
                                        console.log(`Document on libgen - Mirror selection page: ${response.responseUrl}`)
                                    });
                                    request.end();
                                    console.log(`Working Download Mirror Link: ${libgenSection}`)
                                } else {
                                    // message.reply(`Not found on Sci-Hub! :( Try the following Google Scholar link (Incase they have a free PDF)`)
                                    // scholarLink = scholar(querystring.escape(originalLink))
                                    // scholarLink = scholarLink.substring(0, scholarLink.length - 1)
                                    // scholarLink = scholarLink.substring(0, scholarLink.indexOf('"')) + scholarLink.substring(scholarLink.indexOf('"') + 1)
                                    // message.channel.send(scholarLink)
                                    var doiNoHTTPS = originalLink
                                    if (originalLink.includes('doi.org')) {
                                        if (originalLink.includes('https')) {
                                            doiNoHTTPS = doiNoHTTPS.replace('https://doi.org/', '')
                                        } else if (originalLink.includes('http')) {
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
                                            }
                                        })

                                }
                            } else {
                                if (found[1].indexOf("https") === -1) {
                                    found[1] = "https:" + found[1];
                                }
                                try {
                                    console.log(found[1])
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

                // if (originalLink.includes('https://doi.org/')) {
                //     var scholarSearchTerm = originalLink.replace('https://doi.org/', '')
                //     scholarLink = scholar(querystring.escape(scholarSearchTerm))
                //     console.log(scholarLink)
                //     superagent
                //     .get(scholarLink)
                //     .end(req, res) {

                //     }
                // } 
                // scholarLink = scholar(querystring.escape(originalLink))
                // scholarLink = scholarLink.substring(0, scholarLink.length - 1)
                // scholarLink = scholarLink.substring(0, scholarLink.indexOf('"')) + scholarLink.substring(scholarLink.indexOf('"') + 1)
                // message.channel.send(scholarLink)

                superagent
                    .get(originalLink)
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
                console.log(found[1])
                // console.log({
                //     files: [found[1] + ".pdf"]
                // }).catch(err => console.log(err))
            } catch (e) {
                console.log(e)
            }
        }
    })
