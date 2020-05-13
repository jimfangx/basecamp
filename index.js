const cheerio = require('cheerio')
const request = require('request')
request(`https://hspolicy.debatecoaches.org/Archbishop%20Mitty/Patwa-Aggarwal%20Neg`, (err, res, html) => {
    const $ = cheerio.load(html)
    var rounds = []
    var twoNRs = []
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
        if (!roundStr.includes("1AC") || !roundStr.includes("1NC") || !roundStr.includes("2NR")) {
            obj.troll = true
        } else {
            obj.troll = false
        }
        var tempStrTournRound = roundStr.substring(0, roundStr.indexOf("Opponent"))
        // console.log(roundStr)

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

        } else {
            obj.tournament = tempStrTournRound.substring(0, tempStrTournRound.length - 1)
            obj.round = tempStrTournRound.substring(tempStrTournRound.length - 1, tempStrTournRound.length)
        }

        // Oppoent
        obj.opponent = roundStr.substring(roundStr.indexOf(obj.round) + obj.round.length + 10, roundStr.indexOf(" | Judge:"))

        // Judge
        obj.judge = roundStr.substring(roundStr.indexOf("Judge:") + 7, roundStr.indexOf("1AC"))

        // 1AC
        obj.oneAC = roundStr.substring(roundStr.indexOf("1AC") + 4, roundStr.indexOf("1NC"))

        // 1NC List
        obj.oneNC = roundStr.substring(roundStr.indexOf("1NC") + 5, roundStr.indexOf("2NR")).split("- ")

        //2NR List
        obj.twoNR = roundStr.substring(roundStr.indexOf("2NR") + 5).split("- ")


        rounds.push(obj)
    }
    console.log(rounds)

    // move all args into 1 array
    for (var i = 0; i < rounds.length; i++) {
        for (j = 0; j < rounds[i].twoNR.length; j++) {
            twoNRs.push(rounds[i].twoNR[j])
        }
    }
    // console.log(twoNRs)
    // find most occurence of 2nr args

    // create array record count of each arg.
})
