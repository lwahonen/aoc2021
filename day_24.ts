#!/usr/bin/env ts-node-script
/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
/*eslint prefer-const: 0*/

import {fetchInputData, keyCount, parseMap} from './libraries';
import {parseInt} from "lodash";
import _ = require("lodash");

const isNode = require('detect-node');

const year = 2021;
const day = 24;

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

let ops=file.trim().split("\n").map(f=> {
    let match = f.match(/([^ ]+) ([^ ]{1})[ ]?([^ ]*)/);
    return {op:match[1],first:match[2],second:match[3]};
})

function isDigit(second: string) {
    return second.search(/\d+/) != -1
}

let AX=[]
for (let op of ops) {
    if (op.op == "add" && op.first == "x" && isDigit(op.second))
        AX.push(parseInt(op.second))
}
let DZ=[]
for (let op of ops) {
    if (op.op == "div" && op.first == "z" && isDigit(op.second))
        DZ.push(parseInt(op.second))
}

let AY=[]
let skip = 0
for (let op of ops) {
    if (op.op == "add" && op.first == "y" && isDigit(op.second)) {
        if (skip == 2) {
            AY.push(parseInt(op.second))
            skip = 0
        }
        else{
            skip++
        }
    }
}

if(debug) console.log("add x instructions range: "+JSON.stringify(AX))
if(debug) console.log("div z instructions range: "+JSON.stringify(DZ))
if(debug) console.log("add y instructions range: "+JSON.stringify(AY))

let states_for_z={}
states_for_z[-1]= {};
states_for_z[-1][0]={previous:[0], digits:""};

for (let i = 0; i < 14; i++) {
    states_for_z[i] = {};
    let prevStates = states_for_z[i - 1];
    // Free previous lump
    states_for_z[i - 2]={};
    console.log("Moving on to digit "+i+". Tracking "+keyCount(prevStates)+" objects")
    for (let j = 9; j  > 0; j--) {

        for (let prevstate in prevStates) {
            let z_state = get_next_z(i, prevstate, j)
            // Can reach the same state with a higher value for 1st digit
            if (states_for_z[i].hasOwnProperty(z_state))
                continue;
            let last = prevStates[prevstate];
            // The pushes from first 4 digits need to match the pops of the last four digits
            if (i >= 10 && last.previous[13 - i] != z_state)
                continue;
            let previous = last.previous;
            if (i < 5)
                previous = previous.concat([z_state]);
            states_for_z[i][z_state] = {previous: previous, digits: last.digits + j,};
        }
        // let z_state = get_next_z(i, 0, j)
    }
}

console.log("All possible solutions found. Total variations "+keyCount(states_for_z[13])+" objects")
console.log("Part 1: "+JSON.stringify(states_for_z[13][0].digits))


states_for_z={}
states_for_z[-1]= {};
states_for_z[-1][0]={previous:[0], digits:""};

for (let i = 0; i < 14; i++) {
    states_for_z[i] = {};
    let prevStates = states_for_z[i - 1];
    // Free previous lump
    states_for_z[i - 2]={};
    console.log("Moving on to digit "+i+". Tracking "+keyCount(prevStates)+" objects")
    for (let j = 1; j <10; j++) {

        for (let prevstate in prevStates) {
            let z_state = get_next_z(i, prevstate, j)
            // Can reach the same state with a higher value for 1st digit
            if (states_for_z[i].hasOwnProperty(z_state))
                continue;
            let last = prevStates[prevstate];
            // The pushes from first 4 digits need to match the pops of the last four digits
            if (i >= 10 && last.previous[13 - i] != z_state)
                continue;
            let previous = last.previous;
            if (i < 5)
                previous = previous.concat([z_state]);
            states_for_z[i][z_state] = {previous: previous, digits: last.digits + j,};
        }
        // let z_state = get_next_z(i, 0, j)
    }
}

console.log("All possible solutions found. Total variations "+keyCount(states_for_z[13])+" objects")
console.log("Part 2: "+JSON.stringify(states_for_z[13][0].digits))

function get_next_z(input_index,last_z,input_char) {
    /*

inp w
mul x 0
add x z
mod x 26
div z [FROM DIV Z LIST]

     */
    let x = last_z % 26;
    let z=Math.floor(last_z / DZ[input_index]);
    /*

add x [FROM ADD X LIST]
eql x w
eql x 0

         */

    x += AX[input_index];
    if (x == input_char) {
        x = 0
    } else {
        x = 1
    }

    /*


mul y 0
add y 25
mul y x
add y 1
mul z y

     */

    let y = 25;
    y = y*x;
    y += 1;
    z = z*y;

    /*

mul y 0
add y w
add y [FROM ADD Y LIST]
mul y x
add z y

     */
    y=input_char;
    y += AY[input_index];
    y = y*x;
    z += y;

    return z
}
