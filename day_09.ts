/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
import {fetchInputData} from './libraries';
import _ = require("lodash");


const isNode = require('detect-node');

const year = 2021;
const day = 9;

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
const testInput = 0;
if (testInput == 1) {
    file = `2199943210
3987894921
9856789892
8767896789
9899965678`;
}
const debug = false

const data = file.trim().split("\n").map(f => f.split("").map(a => parseInt(a)));

const max_y = data[0].length;
const max_x = data.length;

const lowPoints = new Set();
for (let x = 0; x < max_x; x++) {
    for (let y = 0; y < max_y; y++) {
        if (x > 0 && data[x][y] >= data[x - 1][y])
            continue
        if (y > 0 && data[x][y] >= data[x][y - 1])
            continue
        if (x < max_x - 1 && data[x][y] >= data[x + 1][y])
            continue
        if (y < max_y - 1 && data[x][y] >= data[x][y + 1])
            continue
        if (debug) console.log(`Lowpoint found at ${x},${y}`)
        lowPoints.add({x, y})
    }
}

let part1 = 0
{
    lowPoints.forEach(coords => {
        // @ts-ignore
        part1 += 1 + data[coords.x][coords.y]
    })
}
console.log(`Part 1 answer ${part1}`)

const part2 = []
lowPoints.forEach(coords => {
    // @ts-ignore
    const basin = countBasin(-1, coords.x, coords.y, new Set<string>());
    if(debug) console.log(`Basin size ${basin}`)
    part2.push(basin)
});

const topThree = _.sortBy(part2).reverse();
const product = topThree[0] * topThree[1] * topThree[2]
console.log(`Part 2 answer ${product}`)


function countBasin(here: number, x: number, y: number, visited: Set<string>) {
    let count = 0;
    const thisPoint = data[x][y];
    const key = `${x},${y}`;
    if (debug) console.log(`Checking ${key}`);
    if (visited.has(key)) {
        if (debug) console.log(`Already visited ${key}`);
        return 0;
    }
    if (thisPoint == 9) {
        if (debug) console.log(`Value is 9 at ${key}`);
        return 0;
    }
    if (thisPoint > here) {
        if (debug) console.log(`Basin does extend to ${key}`);
        visited.add(key)
        count += 1

        if (x > 0)
            count += countBasin(thisPoint, x - 1, y, visited);

        if (y > 0)
            count += countBasin(thisPoint, x, y - 1, visited);

        if (x < max_x - 1)
            count += countBasin(thisPoint, x + 1, y, visited);

        if (y < max_y - 1)
            count += countBasin(thisPoint, x, y + 1, visited);
    }
    return count;
}
