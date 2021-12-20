#!/usr/bin/env ts-node-script
/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
import {fetchInputData, keyCount, parseMap} from './libraries';
import {parseInt} from "lodash";
import _ = require("lodash");

const isNode = require('detect-node');

const year = 2021;
const day = 20;

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

let testinput=0;
if(testinput==1)
{
    file=`
#.#.#..#####.#.#.#.###.##.....###.##.#..###.####..#####..#....#..#..##..###..######.###...####..#..#####..##..#.#####...##.#.#..#.##..#.#......#.###.######.###.####...#.##.##..#..#..#####.....#.#....###..#.##......#.....#..#..#..##..#...##.######.####.####.#.#...#.......#..#.#.#...####.##.#......#..#...##.#.##..#...##.#.##..###.#......#.#.......#.#.#.####.###.##...#.....####.#..#..#.##.#....##..#.####....##...##..#...#......#.#.......#.......##..####..#...#.#.#...##..#.#..###..#####........#..####......#...

#..#.
#....
##..#
..#..
..###
`
}


let tileIndex = file.trim().split("\n\n")[0].trim().split("\n").join("");
let mapdata = file.trim().split("\n\n")[1].trim();
let map=parseMap(mapdata)
console.log(map)

let xmin=0;
let ymin=0;
let xmax=map.x_max;
let ymax=map.y_max;

function getCount(x:number, y:number, patches:any, defaultData:string) {
    let ret = ""
    let key = ""

    function testKey(testKeyString: string) {
        if (patches.hasOwnProperty(testKeyString)) {
            if (patches[testKeyString] == "#")
                ret += "1";
            if (patches[testKeyString] == ".")
                ret += "0";
        } else
            ret += defaultData;
    }

    key = `${x - 1},${y - 1}`;
    testKey(key);

    key = `${x},${y - 1}`;
    testKey(key);

    key = `${x + 1},${y - 1}`;
    testKey(key);

    key = `${x - 1},${y}`;
    testKey(key);

    key = `${x},${y}`;
    testKey(key);

    key = `${x + 1},${y}`;
    testKey(key);

    key = `${x - 1},${y + 1}`;
    testKey(key);

    key = `${x},${y + 1}`;
    testKey(key);

    key = `${x + 1},${y + 1}`;
    testKey(key);

    if (debug) console.log(`For ${x} and ${y} binary is ${ret}`);
    return parseInt(ret, 2)
}

for (let i = 0; i <= 50; i++) {
    let newp = {};
    for (let y = ymin - 3; y <= ymax + 3; y++) {
        let output = "";
        for (let x = xmin - 3; x <= xmax + 3; x++) {
            let defaultData = i % 2 == 0 ? "0":"1";
            let newV = getCount(x, y, map.patches, defaultData);
            let nextChar = tileIndex.charAt(newV);
            if(debug)console.log("That was decimal "+newV+" that corresponds to "+nextChar);
            if(nextChar != defaultData)
                newp[`${x},${y}`] = nextChar;
            output += nextChar;
        }
        if(debug)console.log(output)
    }
    if(i == 2 || i == 50) {
        let vals = [..._.values(map.patches)].filter(x => x == "#");
        console.log("\n\nAfter "+i+" rounds key count is " + vals.length + "\n\n")
    }
    map.patches = newp;
    xmin -= 1;
    xmax += 1;
    ymin -= 1;
    ymax += 1;
}

