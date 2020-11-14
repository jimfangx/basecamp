// https://hspolicy19.debatecoaches.org/

// neg working: https://hspolicy19.debatecoaches.org/Archbishop%20Mitty/Patwa-Aggarwal%\20Neg
// aff working: https://hspolicy19.debatecoaches.org/Archbishop%20Mitty/Patwa-Aggarwal%20Aff
const puppeteer = require('puppeteer');
const { search } = require('superagent');

(async (linkTemp) => {
    var link = 'neg' // this eventaully will be the link but this is just here for t eesting
    if (link.includes('neg')) {
        const browser = await puppeteer.launch({ headless: false, defaultViewport: null })
        const page = await browser.newPage();
        await page.goto(`https://hspolicy19.debatecoaches.org/Advanced%20Technologies%20Academy/Balanovsky-Behnke%20Neg`);
        await page.waitFor(500);

        var twonrList = await page.evaluate(() => {
            var roundReportBlocks = []
            var returnList = []
            for (i = 1; i < document.querySelector("#tblReports > tbody").rows.length; i++) {
                roundReportBlocks.push(document.querySelector(`#tblReports > tbody > tr:nth-child(${i + 1}) > td:nth-child(3) > div > div`))
            }
            console.log(roundReportBlocks)

            for (i = 0; i < roundReportBlocks.length; i++) {
                returnList.push(roundReportBlocks[i].innerText.toLowerCase())
            }

            console.log(returnList)

            for (i = 0; i < returnList.length; i++) {
                returnList[i] = returnList[i].substring(returnList[i].indexOf('2nr'))
                if (!returnList[i].includes('2nr')) {
                    returnList.splice(i, 1)
                    i--;
                } else {
                    returnList[i] = returnList[i].replace('2nr', "")
                    returnList[i] = returnList[i].replace('2NR', "")
                    returnList[i] = returnList[i].replace('2NR -', "")
                    returnList[i] = returnList[i].replace('2nr -', "")
                    returnList[i] = returnList[i].replace('2NR-', "")
                    returnList[i] = returnList[i].replace('2nr-', "")
                    returnList[i] = returnList[i].replace('2NR:', "")
                    returnList[i] = returnList[i].replace('2nr:', "")
                    returnList[i] = returnList[i].replace('-', "")
                    returnList[i] = returnList[i].replace('<br>', "")
                    returnList[i] = returnList[i].replace('</br>', "")
                    returnList[i] = returnList[i].replace('<br/>', "")
                    returnList[i] = returnList[i].replace('<del>', "")
                    returnList[i] = returnList[i].replace('<del/>', "")
                    returnList[i] = returnList[i].replace('</del>', "")
                    returnList[i] = returnList[i].replace('</p>', "")
                    returnList[i] = returnList[i].replace('<p>', "")
                    returnList[i] = returnList[i].replace('<p/>', "")
                    returnList[i] = returnList[i].trim()
                }
            }

            for (i = 0; i < returnList.length; i++) {
                if (returnList[i].includes("-")) { //multiple args for 2nr
                    var singleTwoNRArgList = []
                    singleTwoNRArgList = returnList[i].split("-")
                    returnList.splice(i, 1) // remove current element with multiple args
                    for (j = 0; j < singleTwoNRArgList.length; j++) { // push the multiple args up into the 2nrlist
                        returnList.push(singleTwoNRArgList[j])
                    }
                }
            }

            // last min formatting
            for (i = 0; i < returnList.length; i++) {
                returnList[i] = returnList[i].trim()
                returnList[i] = returnList[i].toLowerCase()
            }


            console.log(returnList)
            return (returnList)
        })

        // sorting
        var sortingArray = twonrList;
        var eachArgCounter = new Array(sortingArray.length)
        var newArraySorted = []
        for (i = 0; i < eachArgCounter.length; i++) {
            eachArgCounter[i] = 0
        }


        for (i = 0; i < sortingArray.length; i++) {
            for (j = 0; j < sortingArray.length; j++) {
                // console.log(i)
                if ((sortingArray[i] === sortingArray[j] && i != j) || (sortingArray[j].includes(sortingArray[i]) && i != j && (sortingArray[i].length >= sortingArray[j].length))) { //&& sortingArray[i].length>=sortingArray[j]
                    eachArgCounter[i]++;
                    eachArgCounter.splice(j, 1)
                    sortingArray.splice(j, 1)
                    // i--;
                    j--;
                } else if ((Math.abs(sortingArray[j].length - sortingArray[i].length) <= 3) && i != j) { // fuzzy match for typos. tolorence set at 3 letter difference
                    // check each letter, if error rate < 20% -> PASS
                    var numbersCorrect = 0
                    var numbersWrong = 0
                    var searchWord = sortingArray[i]
                    var wordSearching = sortingArray[j]
                    console.log("In else: searchword:" + searchWord + `, searching for: ${wordSearching}, i is ${i}, j  is ${j}`)
                    while (wordSearching.length > 0) {
                        if (wordSearching.charAt(0) === searchWord.charAt(0)) { // check the 1st letter of each string and keep trimming until youve checked the whole string
                            numbersCorrect++;
                            wordSearching = wordSearching.substring(1)
                            searchWord = searchWord.substring(1)
                        } else {
                            numbersWrong++;
                            wordSearching = wordSearching.substring(1)
                            searchWord = searchWord.substring(1)
                        }
                    }
                    console.log(numbersCorrect)
                    console.log(numbersWrong)
                    if ((numbersCorrect/numbersWrong)*100 >= 80) { // 80% correct -> its a typo, group them together
                        eachArgCounter[i]++;
                        eachArgCounter.splice(j,1)
                        sortingArray.splice(j,1)
                        j--;
                    }


                }
            }
        }
        console.log(sortingArray)
        console.log(eachArgCounter)

        newArraySorted = Math.max(...eachArgCounter)
        for (i = 0; i < eachArgCounter.length; i++) {
            if (newArraySorted === eachArgCounter[i]) {
                console.log(`Most occuring arg is ${sortingArray[i]} at ${eachArgCounter[i] + 1} times`)
            }
        }

    } else {

        const browser = await puppeteer.launch({ headless: false, defaultViewport: null })
        const page = await browser.newPage();
        await page.goto(`https://hspolicy19.debatecoaches.org/Archbishop%20Mitty/Patwa-Aggarwal%20Aff`);
        await page.waitFor(500);

        var twonrList = await page.evaluate(() => {
            var roundReportBlocks = []
            var returnList = []


            // ----------------Seperated by <BR>----------------
            for (i = 1; i < document.querySelector("#tblReports > tbody").rows.length; i++) {
                roundReportBlocks.push(document.querySelector(`#tblReports > tbody > tr:nth-child(${i + 1}) > td:nth-child(3) > div > div > p`))
                // br:nth-child(${$("br", document.querySelector("#tblReports > tbody > tr:nth-child(2) > td:nth-child(3) > div > div > p")).length})`
                // console.log(roundReportBlocks)
            }
            console.log(roundReportBlocks)
            // clean list into a list of 2NR - <arg> or 2NR <arg> 
            for (i = 0; i < roundReportBlocks.length; i++) {
                // console.log(roundReportBlocks[i])
                if (!roundReportBlocks[i].innerHTML.includes('2ar') && !roundReportBlocks[i].innerHTML.includes('2AR')) {
                    returnList.push(roundReportBlocks[i].innerHTML.split('<br>').pop())
                } else if (roundReportBlocks[i].innerHTML.includes('2ar') || roundReportBlocks[i].innerHTML.includes('2AR')) {

                    returnList.push(roundReportBlocks[i].innerHTML.substring(roundReportBlocks[i].innerHTML.indexOf("2nr"), roundReportBlocks[i].innerHTML.indexOf("2ar")))
                    if (returnList[returnList.length - 1] === "") {
                        returnList.splice(returnList.length - 1, 1)
                        returnList.push(roundReportBlocks[i].innerHTML.substring(roundReportBlocks[i].innerHTML.indexOf("2NR"), roundReportBlocks[i].innerHTML.indexOf("2AR")))
                    }
                }
            }
            console.log(returnList)

            // clean list into just args - remove the 2NR label
            for (i = 0; i < returnList.length; i++) {
                // troll/fake/entries that don't contain 2nr entries checking
                if (!returnList[i].includes('2nr') && !returnList[i].includes('2NR')) {
                    returnList.splice(i, 1)
                    i--;
                } else {
                    returnList[i] = returnList[i].replace('2nr', "")
                    returnList[i] = returnList[i].replace('2NR', "")
                    returnList[i] = returnList[i].replace('2NR -', "")
                    returnList[i] = returnList[i].replace('2nr -', "")
                    returnList[i] = returnList[i].replace('2NR-', "")
                    returnList[i] = returnList[i].replace('2nr-', "")
                    returnList[i] = returnList[i].replace('2NR:', "")
                    returnList[i] = returnList[i].replace('2nr:', "")
                    returnList[i] = returnList[i].replace('-', "")
                    returnList[i] = returnList[i].replace('<br>', "")
                    returnList[i] = returnList[i].replace('</br>', "")
                    returnList[i] = returnList[i].replace('<br/>', "")
                    returnList[i] = returnList[i].replace('<del>', "")
                    returnList[i] = returnList[i].replace('<del/>', "")
                    returnList[i] = returnList[i].replace('</del>', "")
                    returnList[i] = returnList[i].trim()
                }
            }
            // console.log(returnList)
            return (returnList)
        })



        for (i = 0; i < twonrList.length; i++) {
            twonrList[i] = twonrList[i].toLowerCase()
            if ((twonrList[i].includes('da') && twonrList[i].includes('cp'))) {

                // using spaces as argument seperators
                if (twonrList[i].substring(twonrList[i].indexOf("cp"), twonrList[i].indexOf("cp") + 3).includes(" ") || twonrList[i].substring(twonrList[i].indexOf("da"), twonrList[i].indexOf("da") + 3).includes(" ")) {
                    var splitList = twonrList[i].split(" ")
                    twonrList.splice(i, 1) // gets rid of the element with multiple args in it - will be replaced by 1 element/arg below
                    // console.log('before while')
                    // console.log(splitList)
                    // let splitListi = 0
                    // console.log('beginnign of while')

                    while (splitList.includes('cp') || splitList.includes('da')) {
                        twonrList.push(splitList[0] + " " + splitList[1])
                        splitList.splice(0, 2)
                        // console.log(`in while`)
                        // console.log(splitList)
                    }

                    // push remaining args back (ex: aspec)
                    for (z = 0; z < splitList.length; z++) {
                        if (!splitList.includes('cp') && !splitList.includes('da')) {
                            twonrList.push(splitList[z].toLowerCase())
                        }
                    }
                }
                // using | as seperators
                else if (twonrList[i].includes('|')) {
                    var splitList = twonrList[i].split("|")
                }
                // using / as seperators
                else if (twonrList[i].includes('/')) {
                    var splitList = twonrList[i].split("/")
                }

            }
        }
        // console.log(twonrList)

        // var returnObject = {
        //     argList: twonrList,
        //     mostOccuring: null
        // }
        // var mostOccuringSortedArray = []
        // var mostOccuringSortedArrayNumbers = []


        // make them all lowercase for sorting
        for (z = 0; z < twonrList.length; z++) {
            twonrList[z] = twonrList[z].toLowerCase()
        }

        // sorting
        var sortingArray = twonrList;
        var eachArgCounter = new Array(sortingArray.length)
        var newArraySorted = []
        for (i = 0; i < eachArgCounter.length; i++) {
            eachArgCounter[i] = 0
        }


        for (i = 0; i < sortingArray.length; i++) {
            for (j = 0; j < sortingArray.length; j++) {
                if (sortingArray[i] === sortingArray[j] && i != j) {
                    eachArgCounter[i]++
                    sortingArray.splice(j, 1)
                }
            }
        }
        console.log(sortingArray)
        console.log(eachArgCounter)

        newArraySorted = Math.max(...eachArgCounter)
        for (i = 0; i < eachArgCounter.length; i++) {
            if (newArraySorted === eachArgCounter[i]) {
                console.log(`Most occuring arg is ${sortingArray[i]} at ${eachArgCounter[i] + 1} times`)
            }
        }

        // old sorting
        // let mostOccuring = mostFreqStr(twonrList)
        // console.log(mostOccuring)
        // while (twonrList.length > 0) {
        //     let mostOccuring = mostFreqStr(twonrList)
        //     console.log(mostOccuring)
        //     mostOccuringSortedArray.push(mostOccuring)
        //     var mostOccuringTemp = 0;
        //     for (i = 0; i < twonrList.length; i++) {
        //         if (twonrList[i] === mostOccuring) {
        //             twonrList.splice(i, 1)
        //             mostOccuringTemp++;
        //         }
        //     }
        //     mostOccuringSortedArrayNumbers.push(mostOccuringTemp)
        // }

    }
})();