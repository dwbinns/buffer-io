const tap = require('tap');
const {BufferReader, BufferWriter} = require('..');

const testData = [
    ['U64BE',0x123456789ABC],
    ['U32BE',0x23456789],
    ['U24BE',0x334455],
    ['U16BE',0x1122],
    ['U8',0x78],
    ['Bytes',Uint8Array.of(50,60,70)],
];

let bufferWriter = new BufferWriter();
testData.forEach(([type, value]) => bufferWriter[`write${type}`](value));

let bufferReader = new BufferReader(bufferWriter.getUint8Array());

let resultData = testData.map(([type]) => [type, bufferReader[`read${type}`]()]);

tap.same(testData, resultData, "Round trip succeeded");
