/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
import {fetchInputData} from './libraries';
import _ = require("lodash");
import {parseInt, trim} from "lodash";
import {json} from "stream/consumers";


const isNode = require('detect-node');

const year = 2021;
const day = 14;

let file = '';

if (isNode) {
    file = fetchInputData(year, day);
} else {
    const sync_fetch = require('sync-fetch');
    file = sync_fetch(`data/day_${day}.txt`).text();
}

/// ////////////////////////////////////////////////
// START HERE
/// ////////////////////////////////////////////////
//
let testInput = 0;
if (testInput == 1) {
    file = `
NNCB

CH -> B
HH -> N
CB -> H
NH -> C
HB -> C
HC -> B
HN -> C
NN -> C
BH -> H
NC -> B
NB -> B
BN -> B
BB -> N
BC -> B
CC -> N
CN -> C
`;
}

const debug = false;

let entries = file.trim().split("\n\n");
let polymers = entries[0].trim().split("");

let rules = entries[1].split("\n").map(f => {
    let pair = f.split(" -> ");
    return {from: pair[0], to: pair[1]}
});

if (debug) console.log(`Polymer list ${polymers}`);
if (debug) console.log(`Rules list ${rules}`);

// Split the string into a list of 2-letter molecyles
let molecyles = {}
for (let i = 0; i < polymers.length - 1; i++) {
    let seek = polymers[i];
    let peek = polymers[i + 1];
    let key = `${seek}${peek}`;
    if (!molecyles.hasOwnProperty(key))
        molecyles[key] = 0;
    molecyles[key] += 1;
}

for (let round = 1; round <= 40; round++) {
    let newmolecyles = {...molecyles};
    for (let molecyle in molecyles) {
        let count = molecyles[molecyle];
        for (let rule of rules) {
            if (molecyle == rule.from) {
                // Consumed these in the reaction
                newmolecyles[molecyle] -= count;

                // Created these instead
                let firstProduct = `${molecyle[0]}${rule.to}`;
                if (!newmolecyles.hasOwnProperty(firstProduct))
                    newmolecyles[firstProduct] = 0;
                newmolecyles[firstProduct] += count;


                let secondProduct = `${rule.to}${molecyle[1]}`;
                if (!newmolecyles.hasOwnProperty(secondProduct))
                    newmolecyles[secondProduct] = 0;
                newmolecyles[secondProduct] += count;
                if (debug) console.log(`Turning ${count} pieces of ${molecyle} into as many parts of ${firstProduct} and ${secondProduct}`)
            }
        }
    }
    if (debug) {
        for (let molecyle in newmolecyles)
            console.log(`Molecyle ${molecyle} count is ${newmolecyles[molecyle]}`)
    }
    molecyles = newmolecyles
    if(round == 10 || round == 40)
        console.log(`After round ${round} have ${countResult(newmolecyles)}\n\n`)
}

function countResult(toCount: {}) {
    let maxOcc = {};

    // Every molecyle splits into two, count first letters
    for (let molecyle in toCount) {
        if (!maxOcc.hasOwnProperty(molecyle[0]))
            maxOcc[molecyle[0]] = 0;
        maxOcc[molecyle[0]] += toCount[molecyle];
    }

    // Very last letter of original string is not starter of any pair
    let lastLetter=polymers[polymers.length-1];
    if (!maxOcc.hasOwnProperty(lastLetter))
        maxOcc[lastLetter] = 0;
    maxOcc[lastLetter] += 1;

    // There's probably a pretty fold-reduce-whatever to do this
    let maxOccurrance = 0;
    let minOccurrance = 99999999999999999999999999999;
    let maxElement = '';
    let minElement = '';
    _.forEach(maxOcc, function (value, key) {
        if (value > maxOccurrance) {
            maxElement = key;
        }
        if (value < minOccurrance) {
            minElement = key;
        }
        maxOccurrance = Math.max(value, maxOccurrance);
        minOccurrance = Math.min(value, minOccurrance);
    });

    let result = maxOccurrance - minOccurrance;
    if(debug){
        console.log(`Maximum element ${maxElement} (${maxOccurrance}) minus minimum element ${minElement} (${minOccurrance}) is ${result}`);
    }
    return result;
}

