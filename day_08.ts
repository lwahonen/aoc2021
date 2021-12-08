/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
import {fetchInputData} from './libraries';


const isNode = require('detect-node');

const year = 2021;
const day = 8;

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
    file = `acedgfb cdfbe gcdfa fbcad dab cefabd cdfgeb eafb cagedb ab | cdfeb fcadb cdfeb cdbaf`;
}
if (testInput == 2) {
    file =
`be cfbegad cbdgef fgaecd cgeb fdcge agebfd fecdb fabcd edb | fdgacbe cefdb cefbgd gcbe
edbfga begcd cbg gc gcadebf fbgde acbgfd abcde gfcbed gfec | fcgedb cgb dgebacf gc
fgaebd cg bdaec gdafb agbcfd gdcbef bgcad gfac gcb cdgabef | cg cg fdcagb cbg
fbegcd cbd adcefb dageb afcb bc aefdc ecdab fgdeca fcdbega | efabcd cedba gadfec cb
aecbfdg fbg gf bafeg dbefa fcge gcbea fcaegb dgceab fcbdga | gecf egdcabf bgf bfgea
fgeab ca afcebg bdacfeg cfaedg gcfdb baec bfadeg bafgc acf | gebdcfa ecba ca fadegcb
dbcfg fgd bdegcaf fgec aegbdf ecdfab fbedc dacgb gdcebf gf | cefg dcbef fcge gbcadfe
bdfegc cbegaf gecbf dfcage bdacg ed bedf ced adcbefg gebcd | ed bcgafe cdgba cbgef
egadfb cdbfeg cegd fecab cgb gbdefca cg fgcdab egfdb bfceg | gbdfcae bgc cg cgb
gcafb gcf dcaebfg ecagb gf abcdeg gaef cafbge fdbac fegbdc | fgae cfgab fg bagce
`;
}

const strings = file.trim().split("\n");
const input = strings.map(f => {
    const signals = f.split("|")[0].trim().split(" ").map(f => f.trim())
    const display = f.split("|")[1].trim().split(" ").map(f => f.trim())
    return {signals, display}
})

let part1 = 0

for (const ii of input) {
    for (const dd of ii.display) {
        const length = dd.length;
        if (length == 2 || length == 4 || length == 7 || length == 3
        )
            part1++;
    }
}
console.log(`Part 1: ${part1}`)

let part2 = 0
for (const ii of input)
    part2 += solveRow(ii.signals, ii.display)

console.log(`Part 2: ` + part2)

function solveRow(signals: string[], display: string[]) {
    const debug=false;
    const solution = [];
    // The only one with length 2
    solution[1] = signals.filter(f => f.length == 2).flat()[0];
    // The only one with length 4
    solution[4] = signals.filter(f => f.length == 4).flat()[0];
    // The only one with length 3
    solution[7] = signals.filter(f => f.length == 3).flat()[0];
    // The one with all segments lit
    solution[8] = signals.filter(f => f.length == 7).flat()[0];

    // Three different shapes for 5-segment display
    // Number 3 is the only one that shares both segments with number one
    solution[3] = signals.filter(f => {
        if (f.length != 5) return false;
        for (const letter of solution[1].split(""))
            if (f.indexOf(letter) == -1) {
                if(debug) console.log(`${f} cannot be digit three`);
                return false;
            }
        if(debug) console.log(`${f} has to be digit three`);
        return true;
    }).flat()[0];

    // We can use the number 3 we just found to tell between numbers
    // 9, 0 and 6
    // Number 9 is the one that shares all segments of 3
    solution[9] = signals.filter(f => {
        if (f.length != 6) return false;
        for (const letter of solution[3].split(""))
            if (f.indexOf(letter) == -1) {
                if(debug) console.log(`${f} cannot be digit nine`);
                return false;
            }
        if(debug) console.log(`${f} has to be digit nine`);
        return true;
    }).flat()[0];

    // We can use the number 1 we got earlier
    // and the digit 9 just found
    // to tell between 9, 0 and 6
    for (const signal of signals) {
        if (signal.length != 6)
            continue;
        if (signal == solution[9])
            continue;
        let is_zero = true;
        for (const letter of solution[1].split("")) {
            // Segment mismatch, can't be zero
            if (signal.indexOf(letter) == -1) {
                is_zero = false;
            }
        }
        if (is_zero) {
            if(debug) console.log(`${signal} cannot be digit six, it has to be digit zero`);
            solution[0] = signal;
        } else {
            if(debug) console.log(`${signal} cannot be digit zero, it has to be digit six`);
            solution[6] = signal;
        }
    }

    // Three different shapes for 5-segment display
    // Number 5 is the only one that shares all segments with number six
    solution[5] = signals.filter(f => {
        if (f.length != 5) return false;
        for (const letter of f.split(""))
            if (solution[6].indexOf(letter) == -1) {
                if(debug) console.log(`${f} cannot be digit five`);
                return false;
            }
        if(debug) console.log(`${f} has to be digit five`);
        return true;
    }).flat()[0];

    // Now we can pick the last five-segment number easily
    solution[2] = signals.filter(f => {
        if (f.length != 5) return false;

        if (f == solution[3]) {
            if(debug) console.log(`${f} cannot be digit two, as it is digit three`);
            return false;
        }
        if (f == solution[5]) {
            if(debug) console.log(`${f} cannot be digit two, as it is digit five`);
            return false;
        }
        if(debug) console.log(`${f} has to be digit two`);
        return true;
    }).flat()[0];

    let ans = ""
    for (const digit of display) {
        for (let i = 0; i < 10; i++) {
            const candidate = solution[i].split("").sort().join("");
            const sorted = digit.split("").sort().join("");
            if (candidate == sorted)
                ans += i;
        }
    }
    return parseInt(ans);
}