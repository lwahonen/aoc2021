#!/usr/bin/env ts-node-script
/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
import {fetchInputData, keyCount, parseMap} from './libraries';
import {parseInt} from "lodash";
import _ = require("lodash");

const isNode = require('detect-node');

const year = 2021;
const day = 21;

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
let cached = {}

function whoWins(one_score: number, one_pos: number, two_score: number, two_pos: number) {
    let cache_key = `${one_score},${one_pos},${two_score},${two_pos}`;
    if (cached.hasOwnProperty(cache_key)) {
        let answer = cached[cache_key];
        if (debug) console.log("Using cached winners for " + cache_key)
        if (debug) console.log("Winners are " + answer)
        return answer;
    }

    let player_one_wins = 0;
    let player_two_wins = 0;

    const player_one_turns = [];
    for (let roll1 = 1; roll1 <= 3; roll1++) {
        for (let roll2 = 1; roll2 <= 3; roll2++) {
            for (let roll3 = 1; roll3 <= 3; roll3++) {
                let pos_one = one_pos + roll1 + roll2 + roll3;
                while (pos_one > 10)
                    pos_one -= 10;
                const score_one = one_score + pos_one;
                if (debug) console.log("Player one rolled " + roll1 + " " + roll2 + " " + roll3)
                if (debug) console.log("Player one location now " + pos_one)
                if (debug) console.log("Player one score now " + score_one)

                if (score_one >= 21) {
                    player_one_wins++;
                } else player_one_turns.push({
                    score_one: score_one,
                    pos_one: pos_one,
                    score_two: two_score,
                    pos_two: two_pos,
                })
            }
        }
    }

    let player_two_turns = []
    for (let r of player_one_turns) {
        for (let roll1 = 1; roll1 <= 3; roll1++) {
            for (let roll2 = 1; roll2 <= 3; roll2++) {
                for (let roll3 = 1; roll3 <= 3; roll3++) {
                    let pos_two = r.pos_two + roll1 + roll2 + roll3;
                    while (pos_two > 10)
                        pos_two -= 10;
                    let score_two = r.score_two + pos_two;
                    if (debug) console.log("Player two rolled " + roll1 + " " + roll2 + " " + roll3)
                    if (debug) console.log("Player two location now " + pos_two)
                    if (debug) console.log("Player two score now " + score_two)

                    if (score_two >= 21) {
                        player_two_wins++;
                    } else player_two_turns.push({
                        score_one: r.score_one,
                        pos_one: r.pos_one,
                        score_two: score_two,
                        pos_two: pos_two,
                    })
                }
            }
        }
    }

    for (let possible of player_two_turns) {
        let round = whoWins(possible.score_one, possible.pos_one, possible.score_two, possible.pos_two)
        player_one_wins += round.one_wins;
        player_two_wins += round.two_wins;
    }

    let answer = {one_wins: player_one_wins, two_wins: player_two_wins};
    cached[cache_key] = answer
    if (debug) console.log("Needed to calculate winners for " + cache_key)
    if (debug) console.log("Winners are " + answer)
    return answer
}


function part_one(player_1_pos: number, player_2_pos: number) {
    let pos_one = player_1_pos - 1;
    let pos_two = player_2_pos - 1;
    let die = 1, score_one = 0, score_two = 0, rolls = 0;
    while (true) {
        pos_one += 3 * die + 3;
        die += 3;
        if (die > 100)
            die = die - 100;
        pos_one %= 10;
        score_one += pos_one + 1
        rolls += 3
        if (debug) console.log("Player 1 location " + (pos_one + 1) + " and score " + score_one)
        if (score_one >= 1000)
            break;

        pos_two += 3 * die + 3;
        die += 3;
        if (die > 100)
            die = die - 100;
        pos_two %= 10;
        score_two += pos_two + 1
        rolls += 3
        if (debug) console.log("Player 2 location " + (pos_two + 1) + " and score " + score_two)
        if (score_two >= 1000)
            break;
    }
    if (debug) console.log("Score 1 " + score_one)
    if (debug) console.log("Score 2 " + score_two)
    if (debug) console.log("Die rolls " + rolls)
    if (score_one > score_two)
        console.log("Part 1: " + (score_two * rolls))
    else
        console.log("Part 1: " + (score_one * rolls))
}

let players=file.trim().split("\n").map(f=>parseInt(f.split(":")[1].trim()))
part_one(players[0], players[1]);

let data = whoWins(0, players[0], 0, players[1]);
if (debug) console.log("Part 2 calculated, cache size " + keyCount(cached))
if (data.one_wins > data.two_wins)
    console.log("Part 2: Player 1 wins " + data.one_wins)
else
    console.log("Part 2: Player 2 wins " + data.two_wins)
