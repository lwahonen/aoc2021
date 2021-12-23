#!/usr/bin/env ts-node-script
/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
/*eslint prefer-const: 0*/

import {fetchInputData, keyCount, parseMap} from './libraries';
import {parseInt} from "lodash";
import _ = require("lodash");

const isNode = require('detect-node');

const year = 2021;
const day = 23;

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
let testInput = 0
if (testInput == 1) {
    file = `
#############
#...........#
###B#C#B#D###
  #A#D#C#A#
  #########
    `
}
let cached = {}

file = file.trim();

let rows = file.split("\n");

function pull_column(column: number = 3) {
    let r=rows.map(f=>f.charAt(column)).reverse();
    let col=r.flat().join("");
    return col.substring(1, col.length-2)
}

let hallway=rows[1].substring(1);
let rooms=["",pull_column(3),pull_column(5),pull_column(7),pull_column(9)];

let room_depth=pull_column(3).length;
console.log("Part 1 "+JSON.stringify(minimize(hallway, rooms)))

let newrows=rows.slice(0,3);
newrows.push("  #D#C#B#A#");
newrows.push("  #D#B#A#C#");
let tail = rows.slice(3);
newrows.push(...tail);
rows=newrows;

room_depth=pull_column(3).length;
rooms=["",pull_column(3),pull_column(5),pull_column(7),pull_column(9)];
console.log("Part 2 "+JSON.stringify(minimize(hallway, rooms)))


function get_multiplier(targetChar) {
    let mult = 1;
    if (targetChar == "B")
        mult = 10
    if (targetChar == "C")
        mult = 100
    if (targetChar == "D")
        mult = 1000
    return mult;
}

function move_cost(room_id, targetChar, where, pos) {
    let hallway_len = Math.abs(where-(2 * room_id))

    let mult = get_multiplier(targetChar);

    let stepOutCost=0;
    stepOutCost = room_depth-pos;

    let lastStep = 0;
    let distance = hallway_len + stepOutCost - lastStep;
    return mult * distance
}

function is_path_free(hallway:string, room_id:number,where:number) {
    let target = room_id * 2;
    if (where == target)
        return hallway.charAt(target) == "."

    for (let i = Math.min(target, where); i <= Math.max(target, where); i++) {
        if (hallway.charAt(i) != ".")
            return false;
    }
    return true;
}


function pick_room(hallway:string, rooms:any[], room_selected:any) {
    let min = 9999999999999999999;
    let picked = rooms[room_selected];
    let idea = ""

    let occupant = picked.charAt(picked.length - 1);
    for (let hallway_spot = 0; hallway_spot <= hallway.length-2; hallway_spot++) {
        if (hallway_spot == 2 || hallway_spot == 4 || hallway_spot == 6 || hallway_spot == 8)
            continue;

        if (!is_path_free(hallway, room_selected, hallway_spot))
            continue;
        let selected = [...rooms]
        selected[room_selected] = picked.substring(0, picked.length - 1);
        let newhall = hallway.substring(0, hallway_spot) + occupant + hallway.substring(hallway_spot + 1);
        let idea_cost = move_cost(room_selected, occupant, hallway_spot, picked.length-1);
        if (debug) console.log("Trying to move " + occupant + " from room " + room_selected + " to hallway spot " + hallway_spot + " costs "+idea_cost+" with rooms " + JSON.stringify(rooms))
        let remaining_problem = minimize(newhall, selected);
        let solutionCost = idea_cost + remaining_problem.cost;
        if (solutionCost < min) {
            idea = " " + occupant + " to " + hallway_spot + " cost " + idea_cost + "," + remaining_problem.idea;
            min =solutionCost;
            if(debug) console.log("This was a better idea than last! Total cost now just "+min)
        }
        else
        {
            if(debug)console.log("This was a bad idea, cost "+solutionCost);
        }
    }

    return {cost: min, idea: idea};
}

function get_target_char(room)
{
    if(room == 1)
        return "A";
    if(room == 2)
        return "B";
    if(room == 3)
        return "C";
    if(room == 4)
        return "D";
}

function get_target_room(char)
{
    if(char == "A")
        return 1;
    if(char == "B")
        return 2;
    if(char == "C")
        return 3;
    if(char == "D")
        return 4;
}

function can_move_into(room, rooms) {
    for (let i = 0; i < rooms[room].length; i++) {
        if(rooms[room].charAt(i) != get_target_char(room))
            return false;
    }
    return true;
}


function clear_hallway(hallway:string,rooms:any[]) {
    for (let where = 0; where <= hallway.length-2; where++) {
        let occupant = hallway.charAt(where);
        if (occupant == ".")
            continue;
        let targetRoom = get_target_room(occupant);
        let canGo = false;
        if (can_move_into(targetRoom, rooms)) {
            if (targetRoom * 2 > where)
                canGo = is_path_free(hallway, targetRoom, where + 1);
            else
                canGo = is_path_free(hallway, targetRoom, where - 1);
            if (canGo) {
                let newRooms = [...rooms]
                newRooms[targetRoom] += occupant;
                let cost = Math.abs(targetRoom * 2 - where) * get_multiplier(occupant);
                let stepsInRoom=0;
                stepsInRoom=room_depth-rooms[targetRoom].length;
                cost += stepsInRoom * get_multiplier(occupant)
                let new_hallway = hallway.substring(0, where) + "." + hallway.substring(where + 1);
                if(debug)console.log("Moved " + occupant + " to his room, rooms are now " + JSON.stringify(newRooms) + " and hallway is " + new_hallway+" and new cost is "+cost)
                let opt = clear_hallway(new_hallway, newRooms);
                return {cost: cost + opt.cost,hallway:opt.hallway, rooms: opt.rooms,idea:"return "+occupant+" from "+where+" to room "+targetRoom+" cost "+cost+","+opt.idea}
            }
        }
    }
    return {cost: 0, rooms: rooms,idea:"",hallway:hallway}
}

function minimize(hallway:string, rooms:any[]) {
    let key = JSON.stringify(hallway);
    key += JSON.stringify(rooms);
    if (cached.hasOwnProperty(key))
        return cached[key]

    if (debug) console.log("Optimizing situation " + key)

    let cost_so_far = 0;
    let idea = "";


    while (true) {
        let cleared = clear_hallway(hallway, rooms);
        if (cleared.cost > 0) {
            rooms = cleared.rooms;
            cost_so_far += cleared.cost;
            idea += cleared.idea;
            hallway = cleared.hallway;
            continue;
        }
        break;
    }


    if (rooms[1] == "A".repeat(room_depth)
        && rooms[2] == "B".repeat(room_depth)
        && rooms[3] == "C".repeat(room_depth)
        && rooms[4] == "D".repeat(room_depth)) {
        return {cost: cost_so_far, idea: idea + ",DONE"};
    }

    let min = 99999999999999999

    let bestidea=""
    for (let room_id = 1; room_id <= 4; room_id++) {
        let room_state = rooms[room_id];
        // Can move into it == does it only contain target characters
        if (room_state.length > 0 && !can_move_into(room_id, rooms)) {
            let values = pick_room(hallway, rooms, room_id);
            if (values.cost < min) {
                min = values.cost
                bestidea = ", remove occupant from room " + room_id + values.idea;
            }
        }
    }


    let return_data = {cost: cost_so_far + min, idea: idea+bestidea};
    cached[key] = return_data;
    return return_data
}