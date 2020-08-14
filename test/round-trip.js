const {deepEqual} = require('assert').strict;
const { deepStrictEqual } = require('assert');
const {BufferReader, BufferWriter} = require('..');

const testData = [
    ['U64big',0x0123456789ABCDEFn, true],
    ['U64big',0x0123456789ABCDEFn, false],
    ['U32',0x23456789,true],
    ['U32',0x23456789,false],
    ['U24',0x334455,true],
    ['U24',0x334455,false],
    ['U16',0x1122,true],
    ['U16',0x1122,false],
    ['U8',0x78],
    ['Bytes',Uint8Array.of(50,60,70)],
];

for (let littleEndian of [false, true]) {
    let bufferWriter = new BufferWriter().configure({littleEndian});

    testData.forEach(([type, value]) => bufferWriter[`write${type}`](value));

    let bufferReader = new BufferReader(bufferWriter.getUint8Array()).configure({littleEndian});

    let sourceData = testData.map(([type, value]) => [type, value.toString(16)]);
    let resultData = testData.map(([type, value]) => [type, bufferReader[`read${type}`]().toString(16)]);
    deepStrictEqual(resultData, sourceData);
    console.log(`Round trip succeeded: ${littleEndian ? "little" : "big"}Endian`);
}
