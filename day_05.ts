/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
import {fetchInputData} from './libraries';
import _ = require("lodash");


const isNode = require('detect-node');

const year = 2021;
const day = 5;

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
let testInput = false;
if (testInput) {
    file = `0,9 -> 5,9
8,0 -> 0,8
9,4 -> 3,4
2,2 -> 2,1
7,0 -> 7,4
6,4 -> 2,0
0,9 -> 2,9
3,4 -> 1,4
0,0 -> 8,8
5,5 -> 8,2`;
}
// Init & parse
const rows = file.trim().split('\n');
let ID = 0;
let lines = rows.map(s => s.match(/(\d+),(\d+)\s+->\s+(\d+),(\d+)/)).map(f => {
    return {ID: ID++, x1: parseInt(f[1]), y1: parseInt(f[2]), x2: parseInt(f[3]), y2: parseInt(f[4]), original: f[0]}
})


let part1Map = {};
let part2Map = {};

for (let line of lines) {
    // No diagonals
    if (!((line.x1 == line.x2) || (line.y1 == line.y2)))
        continue;
    let xRange = range(line.x1, line.x2);
    let yRange = range(line.y1, line.y2);
    let line_keys = [];
    for (let x of xRange) {
        for (let y of yRange) {
            let key = `(${x}, ${y})`;
            push_point(key, part1Map);
            push_point(key, part2Map);
        }
    }
    // console.log(`Generated points for ${line.x1},${line.y1} => ${line.x2},${line.y2} are ${line_keys}`)
}

let intersectingPoints = 0
_.mapValues(part1Map, function (value, key) {
    if (value > 1) {
        intersectingPoints++;
    }
})

console.log(`Part 1: ${intersectingPoints}`)

for (let line of lines) {
    // Just diagonals
    let lineLen = Math.abs(line.x1 - line.x2);
    if (lineLen != Math.abs(line.y1 - line.y2))
        continue;

    let key = "";
    let line_keys = [];
    for (let i = 0; i <= lineLen; i++) {
        if (line.x1 < line.x2) {
            if (line.y1 < line.y2) {
                key = `(${line.x1 + i}, ${line.y1 + i})`;
            } else {
                key = `(${line.x1 + i}, ${line.y1 - i})`;
            }
        } else {
            if (line.y1 < line.y2) {
                key = `(${line.x1 - i}, ${line.y1 + i})`;
            } else {
                key = `(${line.x1 - i}, ${line.y1 - i})`;
            }

        }

        push_point(key, part2Map);
        line_keys.push(key);
    }
    // console.log(`Generated points for ${line.x1},${line.y1} => ${line.x2},${line.y2} are ${line_keys}`)
}

intersectingPoints = 0
_.mapValues(part2Map, function (value, key) {
    if (value > 1) {
        intersectingPoints++;
    }
})

console.log(`Part 2: ${intersectingPoints}`)


function push_point(key: string, target: {}) {
    if (!target.hasOwnProperty(key))
        target[key] = 1;
    else
        target[key] += 1;
}


function range(start, end) {
    const isReverse = (start > end);
    if (!isReverse)
        return _.range(start, end + 1);
    return _.range(end, start + 1);
}