const cheerio = require('cheerio')
const request = require('request')
request(`https://hspolicy.debatecoaches.org/Archbishop%20Mitty/Patwa-Aggarwal%20Neg`, (err, res, html) => {
    const $ = cheerio.load(html)
    var rounds = []
    var twoNRs = []
    var twoNRsfrequency = []
    for (var i = 1; i < $("#tblReports tr").length; i++) { //1
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





        var roundStrClean = $('#tblReports tr').eq(i).find("td").eq(2).find('div').find('div').html().replace("<p>", "").replace("</p>", "");
        // console.log(roundStrClean)

        // 1AC
        obj.oneAC = roundStrClean.substring(roundStrClean.indexOf("1AC") + 4, roundStrClean.indexOf("<br>"))
        roundStrClean = roundStrClean.substring(roundStrClean.indexOf("<br>") + 4)

        // 1NC
        if (roundStr.includes('1NC')) {
            roundStrClean =  roundStrClean.replace("1NC", "")
            if (roundStr.includes('2NR')) {
                var ncArrayStrTemp = roundStrClean.substring(0, roundStrClean.indexOf('<br>2NR'))
                console.log(roundStrClean.substring(0, roundStrClean.indexOf('<br>2NR')))
            } else {
                var ncArrayStrTemp = roundStrClean
            }
            obj.oneNC = ncArrayStrTemp.split("<br>- ")
            obj.oneNC.splice(0,1)
        }
        console.log(obj)
    }

})

// var missingOneAC = false
// var missingOneNC = false
// var missingTwoNR = false
// console.log(roundStr + "\n")

// // troll marking
// if (!roundStr.includes("1AC") || (!roundStr.includes("1NC") && !roundStr.includes("2NR"))) {
//     obj.troll = true
// } else {
//     obj.troll = false
// }

// // missing speech marking
// console.log("SPEECH MARK\n" + roundStr.includes('1AC') + " " + roundStr.includes('1NC') + " " + roundStr.includes('2NR'))
// console.log(roundStr.indexOf('1AC') + " " + roundStr.indexOf('1NC') + " " + roundStr.indexOf('2NR'))
// if (!roundStr.includes('1AC')) {
//     missingOneAC = true
// } else if (!roundStr.includes('1NC')) {
//     console.log("I AM JDFSJFLKJSDLKF")
//     missingOneNC = true;
// } else if (!roundStr.includes('2NR')) {
//     missingTwoNR = true;
// }

// var tempStrTournRound = roundStr.substring(0, roundStr.indexOf("Opponent"))
// // console.log(roundStr)

// // Tournament & Round
// if (tempStrTournRound.toLowerCase().includes("doubles") || tempStrTournRound.toLowerCase().includes("octas") || tempStrTournRound.toLowerCase().includes("quarters") || tempStrTournRound.toLowerCase().includes("semis") || tempStrTournRound.toLowerCase().includes("finals")) {

//     if (tempStrTournRound.toLowerCase().includes("doubles")) {
//         obj.tournament = tempStrTournRound.substring(0, tempStrTournRound.toLowerCase().indexOf("doubles"))
//         obj.round = "Doubles"
//     }
//     if (tempStrTournRound.toLowerCase().includes("octas")) {
//         obj.tournament = tempStrTournRound.substring(0, tempStrTournRound.toLowerCase().indexOf("octas"))
//         obj.round = "Octas"
//     }
//     if (tempStrTournRound.toLowerCase().includes("quarters")) {
//         obj.tournament = tempStrTournRound.substring(0, tempStrTournRound.toLowerCase().indexOf("quarters"))
//         obj.round = "Quarters"
//     }
//     if (tempStrTournRound.toLowerCase().includes("semis")) {
//         obj.tournament = tempStrTournRound.substring(0, tempStrTournRound.toLowerCase().indexOf("semis"))
//         obj.round = "Semis"
//     }
//     if (tempStrTournRound.toLowerCase().includes("finals")) {
//         obj.tournament = tempStrTournRound.substring(0, tempStrTournRound.toLowerCase().indexOf("finals"))
//         obj.round = "Finals"
//     }

// } else {
//     obj.tournament = tempStrTournRound.substring(0, tempStrTournRound.length - 1)
//     obj.round = tempStrTournRound.substring(tempStrTournRound.length - 1, tempStrTournRound.length)
// }

// // Oppoent
// obj.opponent = roundStr.substring(roundStr.indexOf(obj.round) + obj.round.length + 10, roundStr.indexOf(" | Judge:"))

// // Judge
// obj.judge = roundStr.substring(roundStr.indexOf("Judge:") + 7, roundStr.indexOf("1AC"))

// // 1AC
// if (missingOneNC === true && missingTwoNR === false) {
//     obj.oneAC = roundStr.substring(roundStr.indexOf("1AC") + 4, roundStr.indexOf("2NR"))
//     console.log('IN IF')
//     console.log(roundStr.indexOf("1NC"))
//     console.log(missingOneNC)
//     console.log(missingTwoNR)
// } else {
//     obj.oneAC = roundStr.substring(roundStr.indexOf("1AC") + 4, roundStr.indexOf("1NC"))
//     console.log("I am in else\n\n")
//     console.log(roundStr.indexOf("1NC"))
// }

// // 1NC List
// if (missingOneAC === false) {
//     //Case: Prevent against P - Disclosure from splits... Mitty PA stanford 3 neg
//     obj.oneNC = roundStr.substring(roundStr.indexOf("1NC") + 5, roundStr.indexOf("2NR")).split("- ")
//     // Clean array 
//     for (var k = 0; k < obj.oneNC.length - 1; k++) {
//         if (obj.oneNC[k].length <= 2) {
//             obj.oneNC[k] += obj.oneNC[k + 1]
//             obj.oneNC.splice(k + 1, 1)
//         }
//     }
// } else {
//     obj.oneNC = []
// }

// //2NR List
// if (!roundStr.includes("- ")) { // single arg, no "- "
//     obj.twoNR = roundStr.substring(roundStr.indexOf("2NR")).replace(/^\s+|\s+$/g, ""); // Replace spaces before & after string
//     console.log(obj.twoNR)
// } else {
//     obj.twoNR = roundStr.substring(roundStr.indexOf("2NR") + 5).split("- ")
// }


// rounds.push(obj)
// }

// // Troll detection & removal
// for (var i = 0; i < rounds.length; i++) {
// if (rounds[i].troll) {
//     rounds.splice(i, 1)
// }
// }

// console.log(rounds)

// // move all args into 1 array
// for (var i = 0; i < rounds.length; i++) {
// for (j = 0; j < rounds[i].twoNR.length; j++) {
//     twoNRs.push(rounds[i].twoNR[j])
// }
// }
// // console.log(twoNRs)
// // console.log(twoNRs)
// // find most occurence of 2nr args

// // create array record count of each arg. twoNRsfrequency

// // for (var i = 0; i < twoNRs.length; i++) {
// var occurenceNum = []
// while (twoNRs.length != 0) {
// // var strtoInput = twoNRs[0]
// var occurence = 0
// var searchingFor = twoNRs[0]

// for (var j = 0; j < twoNRs.length; j++) {
//     if (twoNRs[j].includes(searchingFor) || searchingFor.includes(twoNRs[j])) { // check for spelling errors
//         occurence++;
//         twoNRs.splice(j, 1)
//     }
// }
// twoNRsfrequency.push(searchingFor)
// occurenceNum.push(occurence)
// // }
// }
// console.log(twoNRsfrequency)
// console.log(occurenceNum)






 // $('#tblReports tr').each(function() {
    //     var customerId = $(this).find("td").eq(2).html();
    //     console.log(customerId)
    // });