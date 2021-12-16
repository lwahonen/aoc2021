#!/usr/bin/env ts-node-script
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
import {parseInt} from "lodash";

const isNode = require('detect-node');

const year = 2021;
const day = 16;

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
D2FE28
`;
}
if (testInput == 2) {
    file = `
38006F45291200
`;
}
if (testInput == 3) {
    file = `
EE00D40C823060
`;
}
if (testInput == 4) {
    file = `
8A004A801A8002F478
`;
}
if (testInput == 5) {
    file = `
620080001611562C8802118E34
`;
}
if (testInput == 6) {
    file = `
C0015000016115A2E0802F182340
`;
}
if (testInput == 7) {
    file = `
A0016C880162017C3686B18A3D4780
`;
}

const debug = false;

let data = file.trim().split("\n").map(f => f.split("").map(a => {
    return parseInt(a, 16).toString(2).padStart(4, "0");
}))

let joined = data.join("").replace(/,/g, "");

function parsePackets(stream: string) {
    if(debug)console.log(`\nParsing ${stream}`)
    // Empty tail
    if (stream.search("1") == -1) {
        if(debug) console.log("Empty tail found, bailing");
        return null;
    }

    let packet = {}
    packet["subpackets"] = []
    let ver = parseInt(stream.substr(0, 3),2)
    let type = parseInt(stream.substr(3, 3),2);
    packet["version"] = ver;
    packet["type"] = type;
    packet["size"] = 6;
    if (debug) console.log(`Next packet type ${type} and version ${ver}`);
    if (type == 4) {
        let num = "";
        let n = 0;
        while (true) {
            let digit = stream.substr(n * 5 + 6, 5);
            if (debug) console.log(`Next digit is ${digit}`);
            num += digit.substring(1);
            packet["size"] += 5
            if (digit.startsWith("0"))
                break;
            n++;
        }
        if (debug) console.log(`Data for packet is ${num}`);
        packet["data"] = parseInt(num,2);
        return packet;
    } else {
        packet["size"] += 1
        let packetLenType = stream.charAt(6);
        if (packetLenType == "0") {
            if(debug)console.log("This is a fixed length packet")
            let len = stream.substr(7, 15);
            let lenVal = parseInt(len, 2)
            packet["size"] += 15+lenVal;
            let subPackets = stream.substr(7 + 15, lenVal);
            if (debug) console.log(`Len field for packet is ${len} which is ${lenVal}. Parsing subpackets ` + subPackets);
            while (true) {
                let nextPacket = parsePackets(subPackets);
                if (nextPacket == null) {
                    break;
                }
                if(debug)console.log(`Parsed another packet from ${subPackets.substr(0, nextPacket["size"])}`)

                packet["subpackets"].push(nextPacket);
                subPackets = subPackets.substring(nextPacket["size"])
                if (debug) console.log(`Length-limited: Read another subpacket. Subpacket data remaining ${subPackets} and my total size is ${packet["size"]}`);
            }

            return packet;
        }
        if (packetLenType == "1") {
            if(debug)console.log("This is a fixed number packet")
            let len = stream.substr(7, 11);
            let lenVal = parseInt(len, 2)
            let subPackets = stream.substring(7 + 11);
            packet["size"] += 11;
            if (debug) console.log(`Len field for packet is ${len} which is ${lenVal}. Parsing subpackets ` + subPackets);
            packet["subpackets"] = []
            for (let i = 0; i < lenVal; i++) {
                let nextPacket = parsePackets(subPackets);
                if (nextPacket == null) {
                    break
                }
                packet["subpackets"].push(nextPacket);
                packet["size"] += nextPacket["size"];

                if(debug)console.log(`Parsed another packet from ${subPackets.substr(0, nextPacket["size"])}`)

                subPackets = subPackets.substring(nextPacket["size"])
                if (debug) console.log(`Count-limited: Read another subpacket. Subpacket data remaining ${subPackets} and my total size is ${packet["size"]}`);

            }
            return packet;
        }
    }
    return null;
}

let packets = parsePackets(joined)

function countVersions(packet:any) {
    let versum = packet["version"];
    for(let p of packet["subpackets"])
        versum += countVersions(p);
    return versum;
}

function evalPacket(packet:any) {
    let type = packet["type"];
    if(type == 4)
        return packet["data"];
    if(type == 0) {
        let sum = 0
        for (let p of packet["subpackets"])
            sum += evalPacket(p)
        return sum
    }
    if(type == 1) {
        let product = 1
        for (let p of packet["subpackets"])
            product *= evalPacket(p)
        return product
    }
    if(type == 2) {
        let min = evalPacket(packet["subpackets"][0])
        for (let p of packet["subpackets"])
            min= Math.min(evalPacket(p), min);
        return min;
    }
    if(type == 3) {
        let max = evalPacket(packet["subpackets"][0])
        for (let p of packet["subpackets"])
            max= Math.max(evalPacket(p), max);
        return max;
    }
    if(type == 5) {
        let first = evalPacket(packet["subpackets"][0])
        let second = evalPacket(packet["subpackets"][1])
        if(first > second)
            return 1;
        return 0;
    }
    if(type == 6) {
        let first = evalPacket(packet["subpackets"][0])
        let second = evalPacket(packet["subpackets"][1])
        if(first < second)
            return 1;
        return 0;
    }
    if(type == 7) {
        let first = evalPacket(packet["subpackets"][0])
        let second = evalPacket(packet["subpackets"][1])
        if(first == second)
            return 1;
        return 0;
    }

}

console.log("Part 1: "+countVersions(packets))
console.log("Part 2: "+evalPacket(packets))
