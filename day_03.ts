import {fetchInputData} from "./libraries";
import {filter} from "lodash";

const isNode = require('detect-node');

const year = 2021
const day = 3;

let file = "";


if (isNode) {
    file = fetchInputData(year, day);
} else {
    const sync_fetch = require('sync-fetch')
    file = sync_fetch(`data/day_${day}.txt`).text();
}

///////////////////////////////////////////////////
// START HERE
///////////////////////////////////////////////////

let r = file.split("\n")

const {most, least} = countDigits(r);
const part1 = parseInt(most, 2) * parseInt(least, 2);
console.log("Part 1 answer is " + part1);

const O2 = part2_loop("most");
const scrub = part2_loop("least");

const part2 = parseInt(O2, 2) * parseInt(scrub, 2);
console.log("Part 2 answer is " + part2);

function countDigits(rows) {
    let most = "";
    let least = "";
    for (let i = 0; i < rows[0].length; i++) {
        let ones = 0
        let zeros = 0
        for (let j = 0; j < rows.length; j++) {
            if (rows[j].charAt(i) == "1")
                ones++;
            if (rows[j].charAt(i) == "0")
                zeros++;
        }
        if (ones > zeros) {
            most += "1"
            least += "0"
        }
        if (ones < zeros) {
            most += "0"
            least += "1"
        }
        if (ones == zeros) {
            most += "1"
            least += "0"
        }
    }
    return {most, least};
}


function part2_loop(key: string) {
    r = file.split("\n");

    for (let i = 0; i < r[0].length; i++) {
        const pair = countDigits(r);
        const pairElement = pair[key];
        const newr = [];

        for (let j = 0; j < r.length; j++) {
            const item = r[j];
            if (item.charAt(i) == pairElement.charAt(i)) {
                newr.push(item);
            }
        }
        if (newr.length == 1) {
            return newr[0]
        }
        r = newr;
    }
}
