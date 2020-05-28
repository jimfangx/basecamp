const { det, opts, version } = require("detergent");
const superagent = require('superagent')
const cheerio = require('cheerio')
const request = require('request')
const stripHtml = require("string-strip-html");

request(`https://hspolicy.debatecoaches.org/Archbishop%20Mitty/Patwa-Aggarwal%20Neg`, (err, res, html) => {
    // https://hspolicy.debatecoaches.org/Archbishop%20Mitty/Patwa-Aggarwal%20Neg
    // https://hspolicy.debatecoaches.org/Archbishop%20Mitty/Dua-Ray%20Neg
    // https://hspolicy.debatecoaches.org/Dulles/Dawar-Joshi%20Neg
    const $ = cheerio.load(html)
    var table = $("#tblReports").html()
    // console.log(table)
    table = table.replace(/<\/p>/g, '\n')

    var clean;
    clean = det(table), {
        fixBrokenEntities: true,
        removeWidows: true,
        convertEntities: true,
        convertDashes: true,
        convertApostrophes: true,
        replaceLineBreaks: false,
        removeLineBreaks: false,
        useXHTML: true,
        dontEncodeNonLatin: true,
        addMissingSpaces: true,
        convertDotsToEllipsis: true,
        stripHtml: true,
        stripHtmlButIgnoreTags: [
            "b",
            "i",
            "em",
            "sup",
            "strong"
        ],
        stripHtmlAddNewLine: ["br", "br/", "p", "/p"],
        cb: null
    }
    // clean = stripHtml(clean.res)

    // replace non space breaks
    // clean = clean.res.replace('/&nbsp;/g', '\n')
    // clean = clean.res.replace('<br/>', '\n')
    // clean = clean.res
    // while (clean.includes("<br/>")) {
    //     clean.replace("<br/>", '\n')
    // }
    clean = clean.res.replace(/<br\s*[\/]?>/gi, "\n")
    clean = clean.replace("Tournament Round Report ", "")
    clean = clean.replace("&nbsp;", " ")
    clean = clean.replace("&mdash;", "-")


    var rounds = []

    for (var i = 1; i < $("#tblReports tr").length; i++) {
        var obj = {
            tournament: "",
            round: "",
            opponent: "",
            judge: "",
            oneAC: "",
            oneNC: "",
            twoNR: "",
            troll: null
        }
        var roundStr = $("#tblReports tr").eq(i).text()
        var tempStrTournRound = roundStr.substring(0, roundStr.indexOf("Opponent"))
        // console.log(roundStr)

        // troll marking
        if (!roundStr.includes("1AC") || (!roundStr.includes("1NC") && !roundStr.includes("2NR"))) {
            obj.troll = true
        } else {
            obj.troll = false
        }
        // Tournament & Round
        if (tempStrTournRound.toLowerCase().includes("doubles") || tempStrTournRound.toLowerCase().includes("octas") || tempStrTournRound.toLowerCase().includes("quarters") || tempStrTournRound.toLowerCase().includes("semis") || tempStrTournRound.toLowerCase().includes("finals")) {

            if (tempStrTournRound.toLowerCase().includes("doubles")) {
                obj.tournament = tempStrTournRound.substring(0, tempStrTournRound.toLowerCase().indexOf("doubles"))
                obj.round = "Doubles"
            }
            if (tempStrTournRound.toLowerCase().includes("octas")) {
                obj.tournament = tempStrTournRound.substring(0, tempStrTournRound.toLowerCase().indexOf("octas"))
                obj.round = "Octas"
            }
            if (tempStrTournRound.toLowerCase().includes("quarters")) {
                obj.tournament = tempStrTournRound.substring(0, tempStrTournRound.toLowerCase().indexOf("quarters"))
                obj.round = "Quarters"
            }
            if (tempStrTournRound.toLowerCase().includes("semis")) {
                obj.tournament = tempStrTournRound.substring(0, tempStrTournRound.toLowerCase().indexOf("semis"))
                obj.round = "Semis"
            }
            if (tempStrTournRound.toLowerCase().includes("finals")) {
                obj.tournament = tempStrTournRound.substring(0, tempStrTournRound.toLowerCase().indexOf("finals"))
                obj.round = "Finals"
            }

        } else { // # rounds
            obj.tournament = tempStrTournRound.substring(0, tempStrTournRound.length - 1)
            obj.round = tempStrTournRound.substring(tempStrTournRound.length - 1, tempStrTournRound.length)
        }

        // Oppoent
        obj.opponent = roundStr.substring(roundStr.indexOf(obj.round) + obj.round.length + 10, roundStr.indexOf(" | Judge:"))

        // Judge
        obj.judge = roundStr.substring(roundStr.indexOf("Judge:") + 7, roundStr.indexOf("1AC"))

        // 1AC
        var oneACtempstr = clean.substring(clean.indexOf("\n"), clean.indexOf("\n", clean.indexOf("\n") + 1)) // will get line containing 1AC. Will include the word 1AC
        oneACtempstr = oneACtempstr.replace('1AC', "")
        oneACtempstr.trim()
        obj.oneAC = oneACtempstr;
        clean = clean.replace(clean.substring(0, clean.indexOf(obj.oneAC) + obj.oneAC.length + 2), "") // remove text all the way up tot he endof the 1AC string. Will also remove the \n at the end of the 1AC string (+2)

        // 1NC
        var upper;
        var onencArray = []
        if (clean.indexOf("1NC") === 0) {
            upper = true
        } else {
            upper = false
        }
        var oneNCtempstr;
        if (upper) {
            oneNCtempstr = clean.substring(3, clean.indexOf("2NR") - 2) // subtract 2 to not include the line break
        } else {
            oneNCtempstr = clean.substring(3, clean.indexOf("2nr") - 2) //these strings include the 1nc mark string
        }

        if (oneNCtempstr.includes("\n")) { // each arg sepearted into its own line
            onencArray = oneNCtempstr.split("\n")
            for (var x = 0; x < onencArray.length; x++) {
                onencArray[x].substring(onencArray[x].match("[a-zA-Z]"))
                onencArray[x].trim()
            }
        } else {
            oneNCtempstr.substring(oneNCtempstr.match("[a-zA-Z]"))
            oneNCtempstr.trim()
            onencArray.push(oneNCtempstr)
        }
        obj.oneNC = onencArray;
        if (upper) { // remove stuff to 2nr
            clean.replace(clean.substring(0, clean.indexOf("2NR")), "")
        } else {
            clean.replace(clean.substring(0, clean.indexOf("2nr")), "")
        }

        // 2 NR
        if (i + 1 != $("#tblReports tr").length) { // not till the end yet
            var nextRound = $("#tblReports tr").eq(i + 1).find('td').eq(1).text() + + " " + $("#tblReports tr").eq(i).find('td').eq(2).text()
            var twoNRtempstr = clean.substring(3, clean.indexOf(nextRound) - 2) // capture without 2NR tag, the content of the 2NR to the end of the 2NR arg block. Will not include \n before the next round block. 
            var twoNRarray = []
            if (twoNRtempstr.includes('\n')) { // each arg seperated into its own line
                twoNRarray = twoNRtempstr.split('\n')
                for (var x = 0; x < onencArray.length; x++) {
                    twoNRarray[x].substring(twoNRarray[x].match("[a-zA-Z]"))
                    twoNRarray[x].trim()
                }
            } else {
                twoNRtempstr.substring(twoNRtempstr.match("[a-zA-Z]"))
                twoNRtempstr.trim()
                twoNRarray.push(oneNCtempstr)
            }
        } else { // last one
            var twoNRtempstr = clean.substring(3)

            if (twoNRtempstr.includes('\n')) { // each arg seperated into its own line
                twoNRarray = twoNRtempstr.split('\n')
                for (var x = 0; x < onencArray.length; x++) {
                    twoNRarray[x].substring(twoNRarray[x].match("[a-zA-Z]"))
                    twoNRarray[x].trim()
                }
            } else {
                twoNRtempstr.substring(twoNRtempstr.match("[a-zA-Z]"))
                twoNRtempstr.trim()
                twoNRarray.push(oneNCtempstr)
            }
        }
        obj.twoNR = twoNRarray;

        console.log(clean)
        console.log()
        console.log(obj)
    }
})