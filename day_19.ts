#!/usr/bin/env ts-node-script
/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
import {fetchInputData, keyCount} from './libraries';
import {parseInt} from "lodash";
import _ = require("lodash");

const isNode = require('detect-node');

const year = 2021;
const day = 19;

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
let required_match = 12;

// Trust me ;)
function doRotate(coord: number[]) {
    return [
        [1 * coord[0], 1 * coord[1], 1 * coord[2]],
        [1 * coord[0], 1 * coord[2], -1 * coord[1]],
        [-1 * coord[2], 1 * coord[0], -1 * coord[1]],
        [-1 * coord[0], -1 * coord[2], -1 * coord[1]],
        [1 * coord[2], -1 * coord[0], -1 * coord[1]],
        [1 * coord[2], -1 * coord[1], 1 * coord[0]],
        [1 * coord[1], 1 * coord[2], 1 * coord[0]],
        [-1 * coord[2], 1 * coord[1], 1 * coord[0]],
        [-1 * coord[1], -1 * coord[2], 1 * coord[0]],
        [-1 * coord[1], 1 * coord[0], 1 * coord[2]],
        [-1 * coord[0], -1 * coord[1], 1 * coord[2]],
        [1 * coord[1], -1 * coord[0], 1 * coord[2]],
        [1 * coord[0], 1 * coord[1], 1 * coord[2]],
        [-1 * coord[2], -1 * coord[0], 1 * coord[1]],
        [1 * coord[0], -1 * coord[2], 1 * coord[1]],
        [1 * coord[2], 1 * coord[0], 1 * coord[1]],
        [-1 * coord[0], 1 * coord[2], 1 * coord[1]],
        [-1 * coord[0], 1 * coord[1], -1 * coord[2]],
        [-1 * coord[1], -1 * coord[0], -1 * coord[2]],
        [1 * coord[0], -1 * coord[1], -1 * coord[2]],
        [1 * coord[1], 1 * coord[0], -1 * coord[2]],
        [1 * coord[1], -1 * coord[2], -1 * coord[0]],
        [1 * coord[2], 1 * coord[1], -1 * coord[0]],
        [-1 * coord[1], 1 * coord[2], -1 * coord[0]],
        [-1 * coord[2], -1 * coord[1], -1 * coord[0]],
    ];
}

// Get coordinate diff between two nodes
function generateTestCoords(first: number[], second: number[]) {
    var c = first.map(function (e, i) {
        return e - second[i];
    });
    return {coord: c, original_first: first, original_second: second}
}

// Can we find an alignment for secondStation nodes that map to firstStation nodes?
function testPair(first: number[][], secondStation: any) {
    let firstDiffs = []

    for (let stationOne_one of first) {
        for (let stationOne_two of first) {
            if (stationOne_one == stationOne_two)
                continue;
            firstDiffs.push(generateTestCoords(stationOne_one, stationOne_two))
        }
    }

    // Just bruteforce 24 different orientations for the coordinate system
    let map = secondStation.beacons.map(f => doRotate(f));
    for (let i in map[0]) {
        let second = [];
        for (let s of map)
            second.push(s[i])
        let secondDiffs = []
        for (let stationTwo_one of second) {
            for (let stationTwo_two of second) {
                if (stationTwo_one == stationTwo_two)
                    continue;
                secondDiffs.push(generateTestCoords(stationTwo_one, stationTwo_two));
            }
        }

        let overlaps = [];

        for (let tester of firstDiffs) {
            for (let otherTest of secondDiffs) {

                if (otherTest.coord[0] == tester.coord[0]
                    && otherTest.coord[1] == tester.coord[1]
                    && otherTest.coord[2] == tester.coord[2]) {
                    overlaps.push([tester, otherTest]);
                    if (overlaps.length == required_match) {
                        let your_coords = overlaps[0][0].original_first;
                        let mine_coords = overlaps[0][1].original_first;

                        let xDiff = your_coords[0] - mine_coords[0];
                        let yDiff = your_coords[1] - mine_coords[1];
                        let zDiff = your_coords[2] - mine_coords[2];
                        let location = [xDiff, yDiff, zDiff];

                        if (debug) console.log(`Found ${required_match} matching station ${secondStation.name}`)
                        if (debug) console.log(`Location ${secondStation.name} resolved to ${location}`)

                        let fixed = []
                        for (let adj of second) {
                            let new_coords = []
                            new_coords[0] = adj[0] + location[0];
                            new_coords[1] = adj[1] + location[1];
                            new_coords[2] = adj[2] + location[2];
                            fixed.push(new_coords)
                        }
                        secondStation.beacons = fixed;
                        secondStation.location = location;
                        return 1;
                    }
                }
            }
        }
    }
    return 0;
}

file = file.trim();
let input = file.split("\n\n").map(f => f.trim());

let stations = input.map(f => {
    let data = f.split("\n")
    return {
        location: [0, 0, 0],
        name: data.shift(),
        beacons: data.map(v => v.trim().split(",").map(k => parseInt(k)))
    }
})

let doneready = {};
doneready[stations[0].name] = stations[0];

while (!keyCount(doneready < stations.length)) {
    let changed = false;
    for (let first of _.values(doneready)) {
        for (let second of stations) {
            if (doneready.hasOwnProperty(second.name))
                continue;
            // @ts-ignore
            let find = testPair(first.beacons, second);
            if (find == 1) {
                // Managed to realign another station
                if (debug) console.log("Aligned station " + second.name + " using " + first)
                doneready[second.name] = second;
                changed = true;
            }
        }
    }
    if (!changed)
        break
}
console.log(`All stations aligned. Aligned count ${keyCount(doneready)} vs total station count ${stations.length}`);

let have = {};
for (let lift of stations) {
    for (let b of lift.beacons) {
        let key = `${b[0]},${b[1]},${b[2]}`
        have[key] = key;
    }
}

console.log("Part 1: " + keyCount(have))

let maxDist = 0;
for (let a of stations) {
    for (let b of stations) {
        let distX = Math.abs(a.location[0] - b.location[0]);
        let distY = Math.abs(a.location[1] - b.location[1]);
        let distZ = Math.abs(a.location[2] - b.location[2]);
        maxDist = Math.max(maxDist, distX + distY + distZ);
    }
}
console.log("Part 2: " + maxDist)