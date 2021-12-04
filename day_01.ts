import {fetchInputData} from "./libraries";

const isNode = require('detect-node');

const year = 2021
const day = 1;

let file = "";


if (isNode) {
    file = fetchInputData(year, day);
} else {
    const sync_fetch = require('sync-fetch')
    file = sync_fetch(`data/day_${day}.txt`).text();
}

///////////////////////////////////////////////////
// START HERE
///////////////////////////////////////////////////

const rows = file.split("\n").map(f => parseInt(f))

let last = 0;
let inc = -1;
for (let i = 0; i < rows.length; i++) {
    if (rows[i] > last) {
        inc++
    }
    last = rows[i]
}
console.log("Part 1: " + inc)

last = 0;
inc = -1;
for (let i = 0; i < rows.length - 2; i++) {
    const number = rows[i] + rows[i + 1] + rows[i + 2];
    if (number > last) {
        inc++
    }
    last = number
}
console.log("Part 2: " + inc)

