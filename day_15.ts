/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
import {fetchInputData} from './libraries';
import _ = require("lodash");
import {
    PriorityQueue,
    MinPriorityQueue,
    MaxPriorityQueue,
    PriorityQueueOptions, // queue options interface
    PriorityQueueItem // queue item interface for min/max queue
} from '@datastructures-js/priority-queue';

const isNode = require('detect-node');

const year = 2021;
const day = 15;

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
1163751742
1381373672
2136511328
3694931569
7463417111
1319128137
1359912421
3125421639
1293138521
2311944581
`;
}

const debug = false;

let data = file.trim().split("\n").map(f => f.split("").map(a => parseInt(a)));


interface location {
    risk: number;
    x: number;
    y: number;
    path: string;
}

function test_and_queue<T>(new_x: number, new_y: number, here: location, map: number[][], visited: any, needsUpdate: any) {
    const key = `${new_x},${new_y}`;
    let new_risk = here.risk + map[new_x][new_y];
    let seen = visited.hasOwnProperty(key);
    let haveBetter = seen && visited[key] <= new_risk;
    if (debug) {
        if (seen && !haveBetter) {
            console.log(`Risk via ${here.path} to ${key} calculated at ${new_risk}. I already have a path to ${key} that has risk ${visited[key]}`);
        }
        if (seen && haveBetter) {
            console.log(`Found a better path to ${key} for risk ${new_risk}. Previous best was ${visited[key]}`);
        }
        if (!seen) {
            console.log(`First path to take via ${key} for risk ${new_risk}`);
        }
    }
    if (!haveBetter) {
        visited[key] = new_risk;
        let new_location = {risk: new_risk, x: new_x, y: new_y, path: `${here.path} ${key}`};
        needsUpdate.enqueue(new_location);
    }
}

function solve_maze(map: number[][]) {
    const needsUpdates = new MinPriorityQueue<location>({
        priority: (l) => {
            return l.risk
        }
    });

    const max_x = map[0].length;
    const max_y = map.length;

    needsUpdates.enqueue({risk: 0, x: 0, y: 0, path: ""});

    let visiteds = {}
    visiteds["0,0"] = 0;

    while (needsUpdates.size() > 0) {
        let here = needsUpdates.dequeue()["element"];
        if (debug) console.log(`Picked ${here.x},${here.y} that has risk ${here.risk}`);
        if (here.x == max_x - 1 && here.y == max_y - 1) {
            if (debug) console.log(`\n\nFound minimum risk path ${here.path} with ${here.risk}\n\n`);
            return here.risk;
        }
        if (here.x < max_x - 1) {
            let new_x = here.x + 1;
            let new_y = here.y;
            test_and_queue(new_x, new_y, here, map, visiteds, needsUpdates);
        }
        if (here.x > 0) {
            let new_x = here.x - 1;
            let new_y = here.y;
            test_and_queue(new_x, new_y, here, map, visiteds, needsUpdates);
        }
        if (here.y < max_y - 1) {
            let new_x = here.x;
            let new_y = here.y + 1;
            test_and_queue(new_x, new_y, here, map, visiteds, needsUpdates);
        }
        if (here.y > 0) {
            let new_x = here.x;
            let new_y = here.y - 1;
            test_and_queue(new_x, new_y, here, map, visiteds, needsUpdates);
        }
    }
}


console.log(`Part 1: ${solve_maze(data)}`);

function get_big_copies(data: number[][]) {
    let bigmap = [];
    for (let firstrow of data) {
        let testrow = [];
        for (let i = 0; i < 5; i++) {
            let increased = firstrow.map(f => {
                let bumped = f + i;
                if (bumped > 9)
                    return bumped - 9;
                return bumped;
            });
            testrow.push(...increased)
        }
        bigmap.push(testrow)
    }

    let biggestmap = [];
    for (let i = 0; i < 5; i++) {
        for (let row = 0; row < bigmap.length; row++) {
            let newrow = [];
            for (let col = 0; col < bigmap[row].length; col++) {
                let bumped = bigmap[row][col] + i;
                if (bumped > 9)
                    newrow.push(bumped - 9);
                else
                    newrow.push(bumped);
            }
            biggestmap.push(newrow)
        }
    }
    return biggestmap;
}

let biggestmap = get_big_copies(data);

console.log(`Part 2: ${solve_maze(biggestmap)}`);