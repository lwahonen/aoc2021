/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
import {fetchInputData} from './libraries';
import _ = require("lodash");
import {parseInt} from "lodash";


const isNode = require('detect-node');

const year = 2021;
const day = 6;

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
    file = `3,4,3,1,2`;
}

// Init & parse
const fishes = file.trim().split(",").map(f => {
    return {time: parseInt(f), initial: false}
})


let gencache={}

function countForDays(target:number) {
    let answer = fishes.map(f => {
        let days = target - f.time;
        // console.log(`This fish has ${days} to create offspring after initial countdown`)
        return generates(days);
    });
    return answer;
}

let part1 = countForDays(80);
console.log(`Part 1 is ${part1.reduce((previousValue, currentValue) => previousValue + currentValue)}`);
let part2 = countForDays(256);
console.log(`Part 1 is ${part2.reduce((previousValue, currentValue) => previousValue + currentValue)}`);


function generates(days: number) {
    if(gencache[days] != undefined)
        return gencache[days];
    // At least me
    let total = 1;
    let remainingDays=days;
    while (remainingDays > 0) {
        remainingDays -= 7;
        total += generates(remainingDays - 2);
    }
    // console.log(`If you have ${days} you'll create ${total} offspring`);
    gencache[days]=total;
    return total
}