/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
import {fetchInputData} from './libraries';
import _ = require("lodash");
import {parseInt} from "lodash";


const isNode = require('detect-node');

const year = 2021;
const day = 11;

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
    
5483143223
2745854711
5264556173
6141336146
6357385478
4167524645
2176841721
6882881134
4846848554
5283751526


    `;
}
const debug = false;

let data = file.trim().split("\n").map(f => f.split("").map(a => parseInt(a)));

const max_y = data[0].length;
const max_x = data.length;

function flashFriends(x: number, y: number, visited: Set<string>) {
    const key = `${x},${y}`;
    if (debug) console.log(`Checking ${key}`);
    if (visited.has(key)) {
        if (debug) console.log(`Already flashed ${key}`);
        return 0;
    }
    data[x][y] += 1;

    if (data[x][y] > 9) {
        if (debug) console.log(`Flashing octopus at ${key}`);
        visited.add(key)

        if (x > 0) {
            flashFriends(x - 1, y, visited);
            if (y > 0)
                flashFriends(x - 1, y - 1, visited);
            if (y < max_y - 1)
                flashFriends(x - 1, y + 1, visited);
        }

        if (y > 0)
            flashFriends(x, y - 1, visited);

        if (x < max_x - 1) {
            flashFriends(x + 1, y, visited);
            if (y > 0)
                flashFriends(x + 1, y - 1, visited);
            if (y < max_y - 1)
                flashFriends(x + 1, y + 1, visited);
        }

        if (y < max_y - 1)
            flashFriends(x, y + 1, visited);
    }
}

let count = 0;
for (let round = 0; round < 100; round++) {
    if (debug) console.log(`\n\nRound ${round}`)
    let flashed = new Set<string>();
    for (let x = 0; x < max_x; x++) {
        for (let y = 0; y < max_y; y++) {
            data[x][y] += 1;
        }
    }
    for (let x = 0; x < max_x; x++) {
        for (let y = 0; y < max_y; y++) {
            let octopus = data[x][y];
            if (octopus > 9) {
                flashFriends(x, y, flashed);
            }
        }
    }
    flashed.forEach(reset => {
        let flashX = parseInt(reset.split(",")[0]);
        let flashY = parseInt(reset.split(",")[1]);
        data[flashX][flashY] = 0;
        count++
    })
}

console.log(`Part 1: Flashed ${count} octopi in 100 rounds`)

data = file.trim().split("\n").map(f => f.split("").map(a => parseInt(a)));

let round = 0;
while (true) {
    let count_round = 0
    round++
    if (debug) console.log(`\n\nRound ${round}`)
    let flashed = new Set<string>();
    for (let x = 0; x < max_x; x++) {
        for (let y = 0; y < max_y; y++) {
            data[x][y] += 1;
        }
    }
    for (let x = 0; x < max_x; x++) {
        for (let y = 0; y < max_y; y++) {
            let octopus = data[x][y];
            // console.log(`Octopus at ${x},${y} has energy level ${octopus}`);
            if (octopus > 9) {
                flashFriends(x, y, flashed);
            }
        }
    }
    if(debug)console.log(`Flashed ${flashed.size} octopi on round ${round}`)
    if (flashed.size == max_x * max_y)
        break;
    flashed.forEach(reset => {
        let flashX = parseInt(reset.split(",")[0]);
        let flashY = parseInt(reset.split(",")[1]);
        data[flashX][flashY] = 0;
        count++
    })
}
console.log(`Part 2: Flashed all ${max_x*max_y} octopi on round ${round}`)

