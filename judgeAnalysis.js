const superagent = require('superagent');
const { det } = require("detergent");
const stripHtml = require("string-strip-html");
const fs = require('fs')
const spreadingSearchdb = require("./spreadingSearchdb.json")
const flowingSearchdb = require("./flowingSearchdb.json")
const truthTechSearchdb = require("./truthTechSearchdb.json")
const techTruthSearchdb = require('./techTruthSearchdb.json')
const techistruthdb = require("./techistruthdb.json")

const noFlowing = require("./noFlowing.json")
const noSpread = require("./noSpread.json");
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
superagent
    .get(`https://www.tabroom.com/index/paradigm.mhtml?judge_person_id=153283`)
    .end((err, res) => {
        var paradigm = res.text.substring(res.text.indexOf(`<div class="paradigm">`) + `<div class="paradigm">`.length, getPosition(res.text, '</div>', 6))
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
                console.log(`:check: Allows spareding`)
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

        // Lay / Flow final verdict
        if ((clean.includes(` lay `) || clean.includes(`parent judge`)) && !flowing) {
            console.log(`Lay judge`)
        } else if ((clean.includes(` lay `) || clean.includes(`parent judge`)) && flowing && !clean.includes(`i hate lay`)) {
            console.log(`Flay judge`)
        } else if (clean.includes(`flow`) && clean.length > 500) {
            console.log(`Flow judge`)
        }
    });
    // personID++;
// }