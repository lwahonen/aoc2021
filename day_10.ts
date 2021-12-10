/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
import {fetchInputData} from './libraries';
import _ = require("lodash");


const isNode = require('detect-node');

const year = 2021;
const day = 10;

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
    
[({(<(())[]>[[{[]{<()<>>
[(()[<>])]({[<{<<[]>>(
{([(<{}[<>[]}>{[]{[(<()>
(((({<>}<{<{<>}{[]{[]{}
[[<[([]))<([[{}[[()]]]
[{[{({}]{}}([{[{{{}}([]
{<[[]]>}<{[{[{[]{()[[[]
[<(<(<(<{}))><([]([]()
<{([([[(<>()){}]>(<<{{
<{([{{}}[<[[[<>{}]]]>[]]
    
    `;
}
const debug = true;

const data = file.trim().split("\n")

function isClosing(c) {
    if (c == ")")
        return true;
    if (c == "]")
        return true;
    if (c == ">")
        return true;
    if (c == "}")
        return true;
    return false;
}

function closingFor(c) {
    if (c == "(")
        return ")";
    if (c == "<")
        return ">";
    if (c == "[")
        return "]";
    if (c == "{")
        return "}";
}

function scoreFor(c) {
    if (c == ")") return 3;
    if (c == "]") return 57;
    if (c == "}") return 1197;
    if (c == ">") return 25137;
    return 0;
}

function valueOf(c) {
    if (c == ")") return 1;
    if (c == "]") return 2;
    if (c == "}") return 3;
    if (c == ">") return 4;
    return 0;
}

let part1 = 0;
let part2 = []

for (let row of data) {
    let item = row
    let done = false;

    if (debug) console.log(`\n\nAnalyzing next item ${row}`)

    while (!done) {
        let newitem = item.replace(/\(\)/g, "");
        if (item != newitem) {
            if (debug) console.log(`Replaced more () pairs, proceeding with ${newitem}`)
            item = newitem;
            continue;
        }
        newitem = item.replace(/\[]/g, "");
        if (item != newitem) {
            if (debug) console.log(`Replaced more [] pairs, proceeding with ${newitem}`)
            item = newitem;
            continue;
        }
        newitem = item.replace(/{}/g, "");
        if (item != newitem) {
            if (debug) console.log(`Replaced more {} pairs, proceeding with ${newitem}`)
            item = newitem;
            continue;
        }
        newitem = item.replace(/<>/g, "");
        if (item != newitem) {
            if (debug) console.log(`Replaced more <> pairs, proceeding with ${newitem}`)
            item = newitem;
            continue;
        }
        if (debug) console.log(`No more pairs to replace, scoring ${item}`)
        for (let i = 0; i < item.length; i++) {
            let c = item.charAt(i);
            if (isClosing(c)) {
                if (debug) console.log(`Found corruption at ${i}, scoring ${c}`)
                part1 += scoreFor(c);
                done = true;
                break;
            }
        }
        if (!done) {
            console.log("This string is incomplete, not corrupt")
            done = true;
            let score = 0;
            let completer = "";
            if (debug) console.log(`Finding closing string for ${item}`)

            while (item.length > 0) {
                score *= 5;
                let scoreItem = item.charAt(item.length - 1);
                let closer = closingFor(scoreItem);
                completer += closer;
                score += valueOf(closer)
                item = item.slice(0, item.length - 1);
            }
            if (debug) console.log(`Closer is ${completer}`)
            part2.push(score)
        }
    }
}

part2 = _.sortBy(part2)
let number = Math.floor(part2.length / 2);

console.log(`Part 1: ${part1}`)
console.log(`Part 2: ${part2[number]}`)
