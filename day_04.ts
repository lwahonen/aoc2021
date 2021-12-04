/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
import {fetchInputData} from './libraries';

const isNode = require('detect-node');

const year = 2021;
const day = 4;

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

// Init & parse
const rows = file.trim().split('\n\n');
const balls = rows[0].split(',').map(f => parseInt(f));
const b = rows.slice(1).map(f => f.split('\n'));
let all_boards = b.map(f =>
    f.map(x =>
        x.split(' ').filter(x => x.length > 0).map(y =>
            parseInt(y))
    ));

const calledBalls = [];

let ID = 0;
for (const board of all_boards) {
    board['ID'] = ID++;
}

const firstBall = balls.shift();
console.log(`\n\nFirst ball is number ${firstBall}`);
calledBalls.push(firstBall);

// Init done, play until first winner
let result = playGame(all_boards, firstBall);
let part1 = getScore(result);
console.log(`Part 1 answer ${part1}`);

// Loop until everyone has won
let winningNumber = result["number"];
while (all_boards.length > 0) {
    console.log(`Resuming games with ${all_boards.length} boards remaining`);
    result = playGame(all_boards, winningNumber);
    winningNumber = result.number;
    all_boards = all_boards.filter(f => f['ID'] != result.board['ID']);
}

// Get score for last winning board
let data = getScore(result);
console.log(`Part 2 answer ${data}`);

function getScore(result: { number: number; board: number[][] }) {
    let winningBoard = result.board;
    let winningNumber = result.number;
    let unmarked = winningBoard.flat().filter(f => !calledBalls.includes(f)).reduce((prev, curr) => prev + curr);

    return unmarked * winningNumber;
}

function playGame(boards: number[][][], number: number) {
    const debugGame = false;
    while (true) {
        for (const board of boards) {
            for (let col = 0; col < board[0].length; col++) {
                let column = board.map(f => f[col]);
                // Find missing balls on column
                let missingBalls = column.filter(f => !calledBalls.includes(f));
                if (missingBalls.length == 0) {
                    if (debugGame) {
                        console.log(`Winner board ${board['ID']} found at ${number}`);
                    }
                    return {board, number};
                }
            }
            for (let row of board) {
                // Find missing balls on row
                let missingBalls = row.filter(f => !calledBalls.includes(f));
                if (missingBalls.length == 0) {
                    if (debugGame) {
                        console.log(`Winner board ${board['ID']} found at ${number}`);
                    }
                    return {board, number};
                }
            }
        }
        number = balls.shift();
        if (debugGame) {
            console.log(`\n\nCalling number ${number}`);
        }
        calledBalls.push(number);
    }
}