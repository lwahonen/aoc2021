import {fetchInputData} from "./libraries";

var isNode = require('detect-node');

const year = 2021
const day = 2;

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

let rows = file.split("\n");

let forward = 0
let down = 0
let depth = 0

function parseWith(s: string, token: string) {
    if (s.startsWith(token)) {
        return parseInt(s.substr(token.length))
    }
    return 0;
}

for (let i = 0; i < rows.length; i++) {
    let s = rows[i]
    let parsed = parseWith(s, "forward ");
    forward += parsed
    let number = parsed * down;
    depth += number;
    down += parseWith(s, "down ");
    down -= parseWith(s, "up ");
}
console.log(`Part 1: ${forward * down}, part 2: ${forward * depth}`)