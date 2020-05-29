const superagent = require('superagent');
const { det } = require("detergent");
const stripHtml = require("string-strip-html");
const fs = require('fs')
const spreadingSearchdb = require("./spreadingSearchdb.json")
const flowingSearchdb = require("./flowingSearchdb.json")

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
// while (personID < 100) { // 234331
    superagent
        .get(`http://tabroom.com/index/paradigm.mhtml?judge_person_id=${personID}`)
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
            console.log(clean)
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
            if (flowing = false) {
                if (clean.length < 500) {
                    console.log(`:x: Flowing not specified or does not flow.`)
                } else {
                    console.log(`:x: & :!: Flowing not specified or does not flow, however long paradigm, so prob a flow judge or judge with experience.`)
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
            if (flowing === false) {
                if (clean.length < 500) {
                    console.log(`:x: Spreading not specified or does not allow spreading.`)
                } else {
                    console.log(`:x: & :!: Spreading not specified or does not allow spreading., however long paradigm, so prob a flow judge or judge with experience.`)
                }
            }


        });
    personID++;
// }