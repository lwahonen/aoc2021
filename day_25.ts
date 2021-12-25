#!/usr/bin/env ts-node-script
/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
/*eslint prefer-const: 0*/

import {fetchInputData, keyCount, parseMap} from './libraries';
import {parseInt} from "lodash";
import _ = require("lodash");

const isNode = require('detect-node');

const year = 2021;
const day = 25;

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

let debug = false
let testInput = 0
if (testInput == 1) {
    file = `

v...>>.vv>
.vv>>.vv..
>>.>v>...v
>>v>>.>.v.
v>v.vv.v..
>.>>..v...
.vv..>.>v.
v.v..>>v.v
....v..v.>

    `
}

let map = parseMap(file.trim())

let round = 0

function moveItem(targetItem, moveX, moveY) {
    let newPatches = {}
    let movedSome = false;
    for (let x = 0; x < map.x_max; x++) {
        for (let y = 0; y < map.y_max; y++) {
            let key = `${x},${y}`;
            if (!map.patches.hasOwnProperty(key))
                continue
            let item = map.patches[key];
            if (item != targetItem && item != ".") {
                if (debug) console.log("Keeping " + item + " at " + key)
                newPatches[key] = item;
            }
            if (item == targetItem) {
                let new_x = x + moveX;
                let new_y = y + moveY;
                if (new_x == map.x_max)
                    new_x = 0;
                if (new_y == map.y_max)
                    new_y = 0;
                // Can't move
                let new_key = `${new_x},${new_y}`;
                if (map.patches.hasOwnProperty(new_key) && map.patches[new_key] != ".") {
                    if (debug) console.log("Can't move to " + new_key + " because there's a " + map.patches[new_key])
                    if (debug) console.log("Keeping " + item + " at " + key)
                    newPatches[key] = item;
                } else {
                    newPatches[new_key] = item;
                    if (debug) console.log("Moved from " + key + " to " + new_key)
                    movedSome = true;
                }
            }
        }
    }
    return {patches: newPatches, movedSome: movedSome}
}


while (true) {
    round++;
    let horizontal = moveItem(">", 1, 0);
    map.patches = horizontal.patches;

    let vertical = moveItem("v", 0, 1);
    map.patches = vertical.patches;
    if (!horizontal.movedSome && !vertical.movedSome)
        break
}
console.log("Stopped after " + round)