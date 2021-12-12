/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
import {fetchInputData} from './libraries';
import _ = require("lodash");
import {parseInt, trim} from "lodash";


const isNode = require('detect-node');

const year = 2021;
const day = 12;

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
start-A
start-b
A-c
A-b
b-d
A-end
b-end
`;
}
if (testInput == 2) {
    file = `
dc-end
HN-start
start-kj
dc-start
dc-HN
LN-dc
HN-end
kj-sa
kj-HN
kj-dc
`;
}
if (testInput == 3) {
    file = `
fs-end
he-DX
fs-he
start-DX
pj-DX
end-zg
zg-sl
zg-pj
pj-he
RW-he
fs-DX
pj-RW
zg-RW
start-pj
he-WI
zg-he
pj-fs
start-RW
`;
}
const debug = false;

let data = file.trim().split("\n").map(f => f.split("-").map(a => trim(a)));
let paths = {};

for (let row of data) {
    addPath(row[1], row[0]);
    addPath(row[0], row[1]);
}

// Pre-insert double tag so it won't visit twice
let part1 = getPaths("start", "-DOUBLE-");
console.log(`Part 1: ${part1.size}`)

let part2 = getPaths("start", "");
console.log(`Part 2: ${part2.size}`)


function addPath(start: string, end: string) {
    if (!paths.hasOwnProperty(start))
        paths[start] = new Set<string>();
    paths[start].add(end)
}

function getPaths(from: string, sofar: string) {
    if (debug) console.log(`Looking where you can go from ${from} on ${sofar}`)
    if (from == "end") {
        let toReturn = sofar + "-end";
        let s = new Set<string>()
        s.add(toReturn)
        if (debug) console.log(`Found end tag on ${toReturn}`)
        return s;
    }
    if (!paths.hasOwnProperty(from)) {
        if (debug) console.log(`Found dead end ${from} on ${sofar}-${from}`)
        return null;
    }

    let dests = paths[from];
    let visits = new Set<string>();
    dests.forEach(next => {
        let double = false;
        if (!isUpperCase(next) && sofar.search(`-${next}-`) != -1) {
            if (debug) console.log(`Already visited ${next} on ${sofar}`)
            if (sofar.search(`-DOUBLE-`) != -1)
                return;
            if (next == "start")
                return;
            double = true;
        }

        let nextx = getPaths(next, `${sofar}-${from}-${double ? "-DOUBLE-" : ""}`)
        if (nextx != null) {
            nextx.forEach(steps => {
                if (debug) console.log(`Found more paths ${steps}`)
                visits.add(steps)
            });
        }
    })
    if (debug) console.log(`Found all tail paths on  ${sofar}`)
    return visits;
}

function isUpperCase(cave) {
    return cave == cave.toUpperCase()
}
