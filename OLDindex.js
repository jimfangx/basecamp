const cheerio = require('cheerio')
const request = require('request')
request(`https://hspolicy.debatecoaches.org/Advanced%20Technologies%20Academy/Self-Gentleman%20Neg`, (err, res, html) => {

    const $ = cheerio.load(html)
    var rounds = []
    var twoNRs = []
    var twoNRsfrequency = []
    // main value entering loop  
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
        roundStr = roundStr.replace("1ac", "1AC")
        roundStr = roundStr.replace("1nc", "1NC")
        roundStr = roundStr.replace('2ac', "2NC")
        roundStr = roundStr.replace("2nc", "2NC")
        roundStr = roundStr.replace("1nr", "1NR")
        roundStr = roundStr.replace("2nr", "2NR")
        roundStr = roundStr.replace("2ar", "2AR")
        roundStr = roundStr.replace(/AND/g, 'and')
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
        roundStrClean = roundStrClean.replace("1ac", "1AC")
        roundStrClean = roundStrClean.replace("1nc", "1NC")
        roundStrClean = roundStrClean.replace('2ac', "2NC")
        roundStrClean = roundStrClean.replace("2nc", "2NC")
        roundStrClean = roundStrClean.replace("1nr", "1NR")
        roundStrClean = roundStrClean.replace("2nr", "2NR")
        roundStrClean = roundStrClean.replace("2ar", "2AR")
        roundStrClean = roundStrClean.replace(/AND/g, 'and')
        console.log(roundStrClean)

        // 1AC
        if (roundStrClean.includes("<br>")) {
            obj.oneAC = roundStrClean.substring(roundStrClean.indexOf("1AC") + 4, roundStrClean.indexOf("<br>"))
            roundStrClean = roundStrClean.substring(roundStrClean.indexOf("<br>") + 4)
        } else if (roundStrClean.includes("<p>")) {
            obj.oneAC = roundStrClean.substring(roundStrClean.indexOf("1AC") + 4, roundStrClean.indexOf("<p>"))
            roundStrClean = roundStrClean.substring(roundStrClean.indexOf("<p>") + 3)
        }

        //clean any - in str
        obj.oneAC = obj.oneAC.substring(obj.oneAC.indexOf(obj.oneAC.match('[a-zA-Z]')))
        // roundStrClean = roundStrClean.substring(roundStrClean.indexOf(roundStrClean.match('[a-zA-Z]')))


        // 1NC
        if (roundStr.includes('1NC')) {
            roundStrClean = roundStrClean.replace("1NC", "")
            if (roundStr.includes('2NR')) {
                if (roundStrClean.includes('<br>')) {
                    if (roundStrClean.includes('2AC')) { // if there is a report for every speech
                        var ncArrayStrTemp = roundStrClean.substring(0, roundStrClean.indexOf('<br>2AC'))
                    } else if (roundStrClean.includes('2NC')) {
                        var ncArrayStrTemp = roundStrClean.substring(0, roundStrClean.indexOf('<br>2NC'))
                    } else {
                        var ncArrayStrTemp = roundStrClean.substring(0, roundStrClean.indexOf('<br>2NR'))
                    }
                } else if (roundStrClean.includes("</p>")) {
                    var ncArrayStrTemp = roundStrClean.substring(0, roundStrClean.indexOf('</p><p>2NR'))
                }
                // console.log(roundStrClean.substring(0, roundStrClean.indexOf('<br>2NR')))
            } else {
                var ncArrayStrTemp = roundStrClean
            }
            // obj.oneNC = ncArrayStrTemp.split("<br>- ") // Doenst work for <p> wikis

            // if has and or , split there
            if (ncArrayStrTemp.includes("and")) {
                obj.oneNC = ncArrayStrTemp.split('and')
            } else if (ncArrayStrTemp.includes(',')) {
                obj.oneAC = ncArrayStrTemp(',')
            } else {
                obj.oneNC = ncArrayStrTemp.split("<br>- ") // 
            }
            // clean any - in each str element of array & remove space before/after text
            for (var x = 0; x < obj.oneNC.length; x++) {
                obj.oneNC[x] = obj.oneNC[x].substring(obj.oneNC[x].indexOf(obj.oneNC[x].match('[a-zA-Z]')))
                obj.oneNC[x] = obj.oneNC[x].trim()
            }

            if (obj.oneNC[0] === "") {  // remove blanks in str
                obj.oneNC.splice(0, 1)
            }

            // update roundstrclean to have 2NRs only
            if (roundStrClean.includes("<br>")) {
                roundStrClean = roundStrClean.substring(roundStrClean.indexOf("<br>2NR") + 7)
                if (roundStrClean.includes("2AR")) {
                    roundStrClean = roundStrClean.substring(0, roundStrClean.indexOf("<br>2AR"))
                }
            } else if (roundStrClean.includes("<p>")) {
                roundStrClean = roundStrClean.substring(roundStrClean.indexOf("<p>2NR") + 6)
            }
        }

        // 2NR
        if (roundStr.includes('2NR')) {
            if (roundStrClean.includes('<br>')) {
                roundStrClean = roundStrClean.replace(roundStrClean.substring(0, roundStrClean.indexOf('<br>2NR') + 7), "")
                // console.log(roundStrClean.substring(0, roundStrClean.indexOf('<br>2NR')+7))
                obj.twoNR = roundStrClean.split("<br>- ")
            } else if (roundStrClean.includes("</p>")) {
                roundStrClean = roundStrClean.replace(roundStrClean.substring(0, roundStrClean.indexOf('<p>2NR') + 7), "")
                // obj.twoNR = roundStrClean.split("<br>- ")

                obj.twoNR = roundStrClean.split("- ")

                for (var z = 0; z < obj.twoNR.length - 1; z++) { // this maybe (prob) is buggy
                    // var lenUpdate = 0
                    // while (true) {
                    if (obj.twoNR[z].includes("and")) {
                        var tempBreakStorage = obj.twoNR[z]
                        obj.twoNR[z] = tempBreakStorage.substring(0, tempBreakStorage.indexOf("and"))
                        obj.twoNR.splice(z + 1, 0, tempBreakStorage.substring(tempBreakStorage.indexOf("and") + 3))
                        // z++;
                    }
                    // }
                }

            } else { // on the same line
                if (!roundStrClean.includes(",") && !roundStrClean.includes("and")) { // same line 1 arg
                    obj.twoNR = roundStrClean.substring(roundStrClean.indexOf("2NR") + 3).split()
                } else if (roundStrClean.includes(",")) { // same line seperated by ,
                    obj.twoNR = roundStrClean.split(",")
                } else if (roundStrClean.includes('and')) { // same line seperated by and
                    obj.twoNR = roundStrClean.split("and")
                }
            }

            // clean any - in each str element of array & remove space before/after text
            for (var x = 0; x < obj.twoNR.length; x++) {
                obj.twoNR[x] = obj.twoNR[x].substring(obj.twoNR[x].indexOf(obj.twoNR[x].match('[a-zA-Z]')))
                obj.twoNR[x] = obj.twoNR[x].trim()
                if (obj.twoNR[x].includes("</p>")) {
                    obj.twoNR[x] = obj.twoNR[x].replace("</p>", "")
                }
            }

            if (obj.twoNR[0] === "") {
                obj.twoNR.splice(0, 1)
            }
        }

        rounds.push(obj)

    }

    // Troll detection & removal
    for (var i = 0; i < rounds.length; i++) {
        if (rounds[i].troll) {
            rounds.splice(i, 1)
        }
    }
    console.log(rounds)


    // move all args into 1 array
    for (var i = 0; i < rounds.length; i++) {
        for (j = 0; j < rounds[i].twoNR.length; j++) {
            twoNRs.push(rounds[i].twoNR[j])
        }
    }
    // console.log(twoNRs)
    // console.log(twoNRs)
    // console.log(twoNRs)
    // find most occurence of 2nr args

    // for (var i = 0; i < twoNRs.length; i++) {
    var occurenceNum = []
    while (twoNRs.length != 0) {
        // var strtoInput = twoNRs[0]
        var occurence = 1
        var searchingFor = twoNRs[0]

        for (var j = 1; j < twoNRs.length; j++) {
            if (twoNRs[j].includes(searchingFor) || searchingFor.includes(twoNRs[j])) { // check for spelling errors
                occurence++;
                twoNRs.splice(j, 1)
            }
        }
        twoNRsfrequency.push(searchingFor)
        occurenceNum.push(occurence)
        twoNRs.splice(0, 1)
        // }
    }
    // console.log(twoNRsfrequency)
    // console.log(occurenceNum)  
    for (var i = 0; i < occurenceNum.length; i++) {
        if (occurenceNum[i] === Math.max(...occurenceNum)) {
            console.log(`Most occuring arg: ${twoNRsfrequency[i]} at ${occurenceNum[i]} times`)
        }
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