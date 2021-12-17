#!/usr/bin/env ts-node-script
/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
import {fetchInputData} from './libraries';
import _ = require("lodash");
import {
    PriorityQueue,
    MinPriorityQueue,
    MaxPriorityQueue,
    PriorityQueueOptions, // queue options interface
    PriorityQueueItem // queue item interface for min/max queue
} from '@datastructures-js/priority-queue';
import {parseInt} from "lodash";

const isNode = require('detect-node');

const year = 2021;
const day = 17;

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
let testInput = 0
if (testInput == 1) {
    file = `
target area: x=20..30, y=-10..-5
`;
}

let x_target = file.split("x=")[1].split(",")[0]
let y_target = file.split("y=")[1].trim();


let x_min = parseInt(x_target.split("..")[0])
let x_max = parseInt(x_target.split("..")[1])
let y_min = parseInt(y_target.split("..")[0])
let y_max = parseInt(y_target.split("..")[1])

function hits(dx: number, dy: number, x: number, y: number, max_y: number) {
    // Too late
    if (y < y_min && dy <= 0) {
        return {success: false, max_y: max_y};
    }

    // Overshot
    if (x_max > 0 && x > x_max && dx >= 0) {
        return {success: false, max_y: max_y};
    }

    // Undershot
    if (x_max < 0 && x < x_max && dx <= 0) {
        return {success: false, max_y: max_y};
    }

    if (x >= x_min && x <= x_max && y >= y_min && y <= y_max) {
        return {success: true, max_y: max_y};
    }

    x += dx;
    y += dy;
    dx -= Math.sign(dx);
    dy -= 1;
    max_y = Math.max(y, max_y);

    return hits(dx, dy, x, y, max_y);
}

let hits_count = 0;
let max_hits = 0;
for (let test_x = -Math.abs(x_max) * 2; test_x < Math.abs(x_max) * 2; test_x++) {
    for (let test_y = y_min; test_y < 1000; test_y++) {
        let status = hits(test_x, test_y, 0, 0, 0);
        if (status.success) {
            hits_count += 1
            max_hits = Math.max(status.max_y, max_hits);
        }
    }
}

console.log(`Part 1 ${max_hits}`);
console.log(`Part 2 ${hits_count}`);
