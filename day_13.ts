/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
import {fetchInputData} from './libraries';
import _ = require("lodash");
import {parseInt, trim} from "lodash";
import {json} from "stream/consumers";


const isNode = require('detect-node');

const year = 2021;
const day = 13;

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
6,10
0,14
9,10
0,3
10,4
4,11
6,0                
6,12
4,1
0,13
10,12
3,4
3,0
8,4
1,10
2,14
8,10
9,0

fold along y=7
fold along x=5
`;
}

const debug = false;

let entries = file.trim().split("\n\n");
let points = entries[0].split("\n").map(f => f.split(",").map(a => parseInt(a)));

let folds = entries[1].split("\n").map(f => f.substring("fold along".length).trim());

if (debug) console.log(`Points cloud:${points}`);
if (debug) console.log(`Folds list${folds}`);

function printmap(points: number[][]) {
    let dupes = new Set();
    let maxx = 0;
    let maxy = 0;
    for (let point of points) {
        maxx = Math.max(maxx, point[0]);
        maxy = Math.max(maxy, point[1]);
        dupes.add(`${point[0]},${point[1]}`);
    }
    for (let y = 0; y <= maxy; y++) {
        let out = "";
        for (let x = 0; x <= maxx; x++) {
            let key = `${x},${y}`;
            if (dupes.has(key))
                out += "#";
            else
                out += " ";
        }
        console.log(out);
    }
}

let printone = true
for (let fold of folds) {
    let foldline = parseInt(fold.substring(2));
    let newpoints = new Set<string>();
    if (fold.charAt(0) == "y") {
        if (debug) console.log(`Folding along Y ${foldline}`);
        for (let point of points) {
            if (point[1] <= foldline) {
                if (debug) console.log(`No need to fold for ${point}`);
                newpoints.add(`${point[0]},${point[1]}`);
            } else {
                let ovelap = point[1] - foldline;
                let newpoint = `${point[0]},${foldline - ovelap}`;
                newpoints.add(newpoint);
                if (debug) console.log(`Folding for ${point} created ${newpoint}`);
            }
        }
    }
    if (fold.charAt(0) == "x") {
        if (debug) console.log(`Folding along X ${foldline}`);
        for (let point of points) {
            if (point[0] <= foldline) {
                if (debug) console.log(`No need to fold for ${point}`);
                newpoints.add(`${point[0]},${point[1]}`);
            } else {
                let ovelap = point[0] - foldline;
                let newpoint = `${foldline - ovelap},${point[1]}`;
                newpoints.add(newpoint);
                if (debug) console.log(`Folding for ${point} created ${newpoint}`);
            }
        }
    }
    let newarray = [];
    newpoints.forEach(f => {
        let x = parseInt(f.split(",")[0]);
        let y = parseInt(f.split(",")[1]);
        newarray.push([x, y]);
    });
    if (debug) printmap(newarray);
    if (debug) console.log(`\n\nPoints cloud is now ${newarray} which is a total of ${newarray.length} points`);
    if (printone)
        console.log(`Part 1:${newarray.length}`);
    printone = false;
    points = newarray;
}
printmap(points);