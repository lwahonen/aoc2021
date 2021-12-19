#!/usr/bin/env ts-node-script
/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
import {fetchInputData} from './libraries';
import _ = require("lodash");
import {parseInt} from "lodash";

const isNode = require('detect-node');

const year = 2021;
const day = 18;

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
[[[0,[4,5]],[0,0]],[[[4,5],[2,6]],[9,5]]]
[7,[[[3,7],[4,3]],[[6,3],[8,8]]]]
[[2,[[0,8],[3,4]]],[[[6,7],1],[7,[1,6]]]]
[[[[2,4],7],[6,[0,5]]],[[[6,8],[2,8]],[[2,1],[4,5]]]]
[7,[5,[[3,8],[1,4]]]]
[[2,[2,2]],[8,[8,1]]]
[2,9]
[1,[[[9,3],9],[[9,0],[0,7]]]]
[[[5,[7,4]],7],1]
[[[[4,2],2],6],[8,7]]
`;
}
if (testInput == 2) {
    file = `
[[[0,[5,8]],[[1,7],[9,6]]],[[4,[1,2]],[[1,4],2]]]
    [[[5,[2,8]],4],[5,[[9,9],0]]]
    [6,[[[6,2],[5,6]],[[7,6],[4,7]]]]
    [[[6,[0,7]],[0,9]],[4,[9,[9,0]]]]
    [[[7,[6,4]],[3,[1,3]]],[[[5,5],1],9]]
    [[6,[[7,3],[3,2]]],[[[3,8],[5,7]],4]]
    [[[[5,4],[7,7]],8],[[8,3],8]]
    [[9,3],[[9,9],[6,[4,9]]]]
    [[2,[[7,7],7]],[[5,8],[[9,3],[0,2]]]]
    [[[[5,2],5],[8,[3,7]]],[[5,[7,5]],[4,4]]]
`;
}

let inputs = file.trim().split("\n").map(f => f.trim());

let debug = false;

function reverse(s: string) {
    return s.split("").reverse().join("")
}

function pumpNext(amount: number, input: string) {
    let single = input.match(/(\d+)/);
    if (single != null) {
        let head = input.substring(0, single.index)
        let tail = input.substring(single.index + single[1].length);
        let n = parseInt(single[1]) + amount;
        let s = head + n + tail;
        if (debug) console.log(`Found next digit to increase by ${amount}  in ${input}, recursing with ${s}`)
        return s;
    }
    if (debug) console.log("No next digit in " + input);
    return input;
}

// Why figure out how to replace last number in string
// when you can just replace first number in reverse(string)
function pumpLast(amount: number, input: string) {
    let fakeInput = reverse(input)

    let single = fakeInput.match(/(\d+)/);
    if (single != null) {
        let head = fakeInput.substring(0, single.index)
        let tail = fakeInput.substring(single.index + single[1].length);
        let reversedMatch = parseInt(reverse(single[1]));
        let n = reverse(`${reversedMatch + amount}`)
        let replaced = head + n + tail
        if (debug) console.log(`Found last digit to increase by ${amount} in ${input}, recursing with ${reverse(replaced)}`)
        return reverse(replaced)
    }
    if (debug) console.log("No last digit in " + input);
    return input;
}


function explode(input: string) {
    let in_number = false;

    let bracestart_index = -1;
    let bracesend_index = -1;

    let brace_deep = 0;
    for (let i = 0; i < input.length; i++) {
        let c = input.charAt(i);
        if (debug) console.log("At " + input.substring(0, i + 1));
        if (c == "[") {
            bracestart_index = i;
            in_number = false;
            brace_deep++;
            if (debug) console.log(`Found higher nesting level. Level now ${brace_deep}`)
            continue;
        }
        if (c == "]") {
            bracesend_index = i;
            in_number = false;
            if (brace_deep > 4) {
                let explodeMe = input.substring(bracestart_index + 1, bracesend_index);
                if (debug) console.log("Exploding deepest pair " + explodeMe)
                let pair = explodeMe.split(",");
                let bighead = pumpLast(parseInt(pair[0]), input.substring(0, bracestart_index))
                let bigtail = pumpNext(parseInt(pair[1]), input.substring(bracesend_index + 1))
                if (debug) console.log(`Pumped ${pair} got ${bighead} and ${bigtail}`)
                return bighead + "0" + bigtail;
            }
            brace_deep--;
            if (debug) console.log(`Found lower nesting level. Level now ${brace_deep}`)
        }
    }
    if (debug) console.log("No need to explode " + input);
    return input
}

function split(input: string) {
    // If we have a two-digit number, split it
    let a = input.match(/(\d\d)/);
    if (a != null) {
        let head = input.substring(0, a.index)
        let tail = input.substring(a.index + a[1].length);
        let parse = parseInt(a[1])
        let first = Math.floor(parse / 2);
        let second = Math.ceil(parse / 2);
        let s = `${head}[${first},${second}]${tail}`;
        if (debug) console.log(`Found two-digit number in ${input}, recursing with ${s}`)
        return s;
    }
    // Did not have
    if (debug) console.log("No splittable digits in " + input);
    return input;
}


function getMagnitude(input: string) {
    // Replace all [x] with just x
    let single = input.match(/\[(\d+)]/);
    if (single != null) {
        let fixed = input.replace(/(\[(\d+)\])/g, "$2")
        if (debug) console.log("Found single digits in " + input + ", recursing with " + fixed)
        return getMagnitude(fixed);
    }
    // Replace the first pair [x,y] with [x*3+y*2]
    let a = input.match(/(\[(\d+),(\d+)\])/);
    if (a != null) {
        let head = input.substring(0, a.index)
        let tail = input.substring(a.index + a[1].length);
        let first = parseInt(a[2])
        let second = parseInt(a[3])
        let replaced = `${head}${first * 3 + second * 2}${tail}`;
        if (debug) console.log("Found pair of digits in " + input + ", recursing with " + replaced)
        return getMagnitude(replaced);
    }
    // Didn't change anything, don't recurse
    return input;
}

let part1 = "["+inputs.shift()+","+inputs.shift()+"]";
if(debug)console.log("Starting with "+part1)
while (true) {
    let exploded = explode(part1)
    if (exploded != part1) {
        if (debug) console.log("after explode:  " + exploded)
        part1 = exploded
        continue
    }
    let splitNum = split(part1)
    if (splitNum != part1) {
        if (debug) console.log("after split:    " + splitNum)
        part1 = splitNum
        continue
    }
    if(debug)console.log("Done reducing "+part1)
    if (inputs.length == 0)
        break
    let s = inputs.shift();
    if(debug)console.log("Next bytes are "+s);
    part1 = "[" + part1 + "," + s + "]";
    if(debug)console.log("\n\nStarting with "+part1)
}
if(debug)console.log(`Final product: ${part1}`)
console.log(`Part 1: ${getMagnitude(part1)}`)

inputs = file.trim().split("\n");

let maxmag = 0;
for (let first of inputs) {
    for (let second of inputs) {
        let part1 = "[" + first + "," + second + "]";
        while (true) {
            let exploded = explode(part1)
            if (exploded != part1) {
                if (debug) console.log("after explode:  " + exploded)
                part1 = exploded
                continue
            }
            let splitNum = split(part1)
            if (splitNum != part1) {
                if (debug) console.log("after split:    " + splitNum)
                part1 = splitNum
                continue
            }
            break;
        }
        maxmag = Math.max(maxmag, getMagnitude(part1))
    }
}
console.log(`Part 2: ${maxmag}`)
