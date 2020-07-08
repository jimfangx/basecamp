const superagent = require('superagent');
const { det } = require("detergent");
const stripHtml = require("string-strip-html");
const fs = require('fs')
const cheerio = require('cheerio')
const moment = require('moment')
const spreadingSearchdb = require("./judgeAnalysisSearchFiles/spreadingSearchdb.json")
const flowingSearchdb = require("./judgeAnalysisSearchFiles/flowingSearchdb.json")
const truthTechSearchdb = require("./judgeAnalysisSearchFiles/truthTechSearchdb.json")
const techTruthSearchdb = require('./judgeAnalysisSearchFiles/techTruthSearchdb.json')
const techistruthdb = require("./judgeAnalysisSearchFiles/techistruthdb.json")
const noFlowing = require("./judgeAnalysisSearchFiles/noFlowing.json")
const noSpread = require("./judgeAnalysisSearchFiles/noSpread.json");
const noHandshakes = require("./judgeAnalysisSearchFiles/noHandshakes.json")
const pronouns = require("./judgeAnalysisSearchFiles/genderPronouns.json")
const noTagCX = require('./judgeAnalysisSearchFiles/noTagTeam.json')
// http://prntscr.com/sxmvag
function getPosition(string, subString, index) {
    return string.split(subString, index).join(subString).length;
}


var replaceHtmlEntites = (function () {
    var translate_re = /&(nbsp|amp|quot|lt|gt);/g,
        translate = {
            'nbsp': String.fromCharCode(160),
            'amp': '&',
            'quot': '"',
            'lt': '<',
            'gt': '>',
            'rsquo': '\'',
            'ldquo': '"'
        },
        translator = function ($0, $1) {
            return translate[$1];
        };

    return function (s) {
        return s.replace(translate_re, translator);
    };
})();

// var firstName = 'Jim'
// var lastName = 'Fang'
// https://www.tabroom.com/index/paradigm.mhtml?search_first=${firstName}&search_last=${lastName}

// var personID = 1
// while (personID < 150) { // 234331

// IMPUT Requires paradigm link
superagent
    .get(`https://www.tabroom.com/index/paradigm.mhtml?judge_person_id=88574`)
    .end((err, res) => {
        const $ = cheerio.load(res.text) // load judged past rounds table
        // console.log(res.text.substring(res.text.indexOf(`<table id="record`)))
        var paradigm = res.text.substring(res.text.indexOf(`<div class="paradigm">`) + `<div class="paradigm">`.length, getPosition(res.text, '</div>', 6))

        var judge = res.text.substring(res.text.indexOf(`<span class="twothirds">`))
        var clean;
        clean = det(paradigm), {
            fixBrokenEntities: true,
            removeWidows: true,
            convertEntities: true,
            convertDashes: true,
            convertApostrophes: true,
            replaceLineBreaks: true,
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
                "sup"
            ],
            stripHtmlAddNewLine: ["li", "/ul"],
            cb: null
        }
        clean = stripHtml(clean.res)

        // if (clean.indexOf(`Your search for ${firstName} ${lastName} returned no judges with paradigms.`) != -1) {
        //     console.log(`Your search for ${firstName} ${lastName} returned no judges with paradigms. Please try again.`)
        //     console.log(`Direct Link: https://www.tabroom.com/index/paradigm.mhtml?search_first=${firstName}&search_last=${lastName}`)
        //     return;
        // }

        // check for specific words etc
        console.log(clean.length)
        clean = clean.toLowerCase();

        // check for flowing requirements
        var flowing = false;
        for (i = 0; i < flowingSearchdb.length; i++) {
            if (clean.includes(flowingSearchdb[i])) {
                console.log(`:check: Flow judge`)
                flowing = true;
                break;
            }
        }
        if (flowing === false) {
            // check for negetive flowing 
            var noFlow;
            for (i = 0; i < noFlowing.length; i++) {
                if (clean.includes(noFlowing[i])) {
                    console.log(`Judge does not flow`)
                    noFlow = true;
                    break;
                }
            }
            if (!noFlow) {
                if (clean.length < 150) {
                    console.log(`:x: Flowing not specified or does not flow. Exteremly short paradigm, prob a lay judge. < 150 char`)
                } else if (clean.length < 500) {
                    console.log(`:x: Flowing not specified or does not flow.`)
                }
                else {
                    console.log(`:x: & :!: Flowing not specified or does not flow, however long paradigm, so prob a flow judge or judge with experience.`)
                    flowing = true;
                }
            }
        }

        // check for spreading

        var spreading = false
        for (i = 0; i < spreadingSearchdb.length; i++) {
            if (clean.includes(spreadingSearchdb[i])) {
                console.log(`:check: Allows spreading`)
                spreading = true;
                break;
            }
        }
        if (spreading === false) {
            var noSpreadvar = false
            for (i = 0; i < noSpread.length; i++) {
                if (clean.includes(noSpread[i]) && clean.length < 10000) { // avoid https://www.tabroom.com/index/paradigm.mhtml?judge_person_id=170624
                    console.log(`Does not allow spreading`)
                    noSpreadvar = true;
                    break;
                }
            }
            if (!noSpreadvar) {
                if (clean.length < 150) {
                    console.log(`:x: Flowing not specified or does not flow. Exteremly short paradigm, prob a lay judge. < 150 char`)
                } else if (clean.length < 500) {
                    console.log(`:x: Spreading not specified or does not allow spreading.`)
                } else {
                    console.log(`:x: & :!: Spreading not specified or does not allow spreading or has special rules about spreading, however long paradigm, so prob a flow judge or judge with experience.`)
                }
            }
        }

        // tech > truth check
        var techOverTruth = false
        var truthOverTech = false
        var truthIsTech = false
        if (!truthOverTech && !truthIsTech) {
            for (i = 0; i < techTruthSearchdb.length; i++) { //Tech > Truth
                if (clean.includes(techTruthSearchdb[i])) {
                    console.log(`Tech > Truth`)
                    techOverTruth = true;
                    break;
                }
            }
        } if (!techOverTruth && !truthIsTech) { //Truth > Tech
            for (i = 0; i < truthTechSearchdb.length; i++) {
                if (clean.includes(truthTechSearchdb[i])) {
                    console.log(`Truth > Tech`)
                    truthOverTech = true;
                    break;
                }
            }
        } if (!techOverTruth && !truthOverTech) {
            for (i = 0; i < techistruthdb.length; i++) {
                if (clean.includes(techistruthdb[i])) {
                    console.log(`Tech = Truth`)
                    truthIsTech = true;
                    break;
                }
            }
        } if (!techOverTruth && !truthOverTech && !truthIsTech) {
            if (clean.length < 150) {
                console.log(`:x: Does not specify relationship between tech & truth. Exteremly short paradigm, prob a lay judge. < 150 char`)
            } else if (clean.length < 500) {
                console.log(`:x: Relationship between tech & truth not specified.`)
            } else {
                console.log(`:x & :!: Relationship between tech & truth not specified, however long paradigm, so prob a flow judge or judge with experience.`)
            }
        }

        // email chain address
        try {
            if (clean.includes(`[at]`)) {
                console.log(clean.match(/([a-zA-Z0-9._-]+\[at\][a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/)[0])
            } else if (clean.includes(`[dot]`)) {
                console.log(clean.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\[dot\][a-zA-Z0-9_-]+)/)[0])
            } else if (clean.includes(`dot`) && clean.includes(`[at]`)) {
                console.log(clean.match(/([a-zA-Z0-9._-]+\[at\][a-zA-Z0-9._-]+\[dot\][a-zA-Z0-9_-]+)/)[0])
            } else {
                console.log(clean.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/)[0])
            }
        } catch (err) {
            console.log(`No email address :(`)
        }

        // aff neg decision ratio
        var affDecisionsTotal = 0
        var negDecisionsTotal = 0
        var affDecisionsYear = 0
        var negDecisionsYear = 0


        for (i = 0; i < $("#record tr").length; i++) {
            var roundTimestamp = $("#record tr").eq(i).find('td').eq(1).text().toLowerCase().trim().substring(0, $("#record tr").eq(i).find('td').eq(1).text().toLowerCase().trim().indexOf("\n"))

            // console.log((Math.trunc(new Date().getTime() / 1000) - roundTimestamp) / 31536000)

            var ev = $("#record tr").eq(i).find('td').eq(2).text().toLowerCase().trim()
            if (ev.includes(`cx`) || ev.includes(`pol`) || ev.includes(`policy`)) {
                ev = true
            } else {
                ev = false
            }

            if ($("#record tr").eq(i).find('td').eq(6).text().toLowerCase().trim() === "aff" && (Math.trunc(new Date().getTime() / 1000) - roundTimestamp) / 31536000 <= 1 && ev) {
                affDecisionsTotal++
                affDecisionsYear++
            } else if ($("#record tr").eq(i).find('td').eq(6).text().toLowerCase().trim() === "neg" && (Math.trunc(new Date().getTime() / 1000) - roundTimestamp) / 31536000 <= 1 && ev) {
                negDecisionsTotal++
                negDecisionsYear++
            } else if ($("#record tr").eq(i).find('td').eq(6).text().toLowerCase().trim() === "aff" && ev) {
                affDecisionsTotal++
            } else if ($("#record tr").eq(i).find('td').eq(6).text().toLowerCase().trim() === "neg" && ev) {
                negDecisionsTotal++
            }
        }
        console.log(`Total policy rounds: ${affDecisionsTotal + negDecisionsTotal}`)
        if (affDecisionsTotal === 0 && negDecisionsTotal === 0) {
            console.log(`No rounds judged`)
        } else {
            console.log(`Aff total decision rate: ${(affDecisionsTotal / (affDecisionsTotal + negDecisionsTotal) * 100)}%`)
            console.log(`Neg total decision ratio: ${(negDecisionsTotal / (affDecisionsTotal + negDecisionsTotal) * 100)}%`)
        }
        if (affDecisionsYear === 0 && negDecisionsYear === 0) {
            console.log(`No rounds judged within last year`)
        } else {
            console.log(`Aff last year decision ratio: ${(affDecisionsYear / (affDecisionsYear + negDecisionsYear) * 100)}%`)
            console.log(`Neg last year decision ratio: ${(negDecisionsYear / (affDecisionsYear + negDecisionsYear) * 100)}%`)
        }

        // handshaking ok?
        var handshake = true
        for (i = 0; i < noHandshakes.length; i++) {
            if (clean.includes(noHandshakes[i])) {
                handshake = false
                break
            }
        }
        console.log(`Handshakes (Defaults to Yes if not specified): ${handshake ? "Yes" : "No"}`)

        // pronouns - Pronoun list source: https://www1.nyc.gov/assets/hra/downloads/pdf/services/lgbtqi/Gender%20Pronouns%20final%20draft%2010.23.17.pdf
        var pronounFinal = "Not specified"
        for (i = 0; i < pronouns.length; i++) {
            if (clean.includes(pronouns[i])) {
                pronounFinal = pronouns[i]
                break
            }
        }
        console.log(`Pronouns: ${pronounFinal}`)

        // tag team
        var tagTeamOK = true;
        for (i = 0; i < noTagCX.length; i++) {
            if (clean.includes(noTagCX[i])) {
                tagTeamOK = false;
                break
            }
        }
        console.log(`Tag Team CX (Defaults to Yes if not specified): ${tagTeamOK ? "Yes" : "No"}`)

        // Lay / Flow final verdict
        if ((clean.includes(` lay `) || clean.includes(`parent judge`)) && !flowing) {
            console.log(`Ultimate Rating: Lay judge`)
        } else if ((clean.includes(` lay `) || clean.includes(`parent judge`)) && flowing && !clean.includes(`i hate lay`)) {
            console.log(`Ultimate Rating: Flay judge`)
        } else if (clean.includes(`flow`) && clean.length > 500) {
            console.log(`Ultimate Rating: Flow judge`)
        }
    });
    // personID++;
// }