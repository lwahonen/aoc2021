/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
import {fetchInputData} from './libraries';
import _ = require("lodash");
import {min, parseInt} from "lodash";


const isNode = require('detect-node');

const year = 2021;
const day = 7;

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
    file = `16,1,2,0,4,2,7,1,2,14`;
}

let minx = 999999;
let maxx = 0;
// Init & parse
const crabs = file.trim().split(",").map(f => {
        let number = parseInt(f);
        minx = Math.min(number, minx);
        maxx = Math.max(number, maxx);
        return number
    }
)
let part1 = 999999999999;
for (let i = minx; i < maxx; i++) {
    let thistotal = 0;
    for (let crab of crabs) {
        let steps = Math.abs(crab - i);
        thistotal += steps;
    }
    if (thistotal < part1)
        part1 = thistotal;
}

console.log(`Part 1 answer is ${part1}`);


let part2 = 999999999999;
for (let i = minx; i < maxx; i++) {
    let thistotal = 0;
    for (let crab of crabs) {
        let steps = Math.abs(crab - i);
        let fuel=steps*(steps + 1)/2;
        thistotal += fuel;
    }
    if (thistotal < part2)
        part2 = thistotal;
}
console.log(`Part 2 answer is ${part2}`);

