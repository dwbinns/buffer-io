const tap = require('tap');
const {BufferReader, BufferWriter} = require('..');

const testData = [
    ['U64big',0x0123456789ABCDEFn, true],
    ['U64big',0x0123456789ABCDEFn,false],
    ['U32',0x23456789,true],
    ['U32',0x23456789,false],
    ['U24',0x334455,true],
    ['U24',0x334455,false],
    ['U16',0x1122,true],
    ['U16',0x1122,false],
    ['U8',0x78],
    ['Bytes',Uint8Array.of(50,60,70)],
];

let bufferWriter = new BufferWriter();
testData.forEach(([type, value, ...extra]) => bufferWriter[`write${type}`](value, ...extra));

let bufferReader = new BufferReader(bufferWriter.getUint8Array());

let sourceData = testData.map(([type, value, ...extra]) => [type, value.toString(16), ...extra]);
let resultData = testData.map(([type, value, ...extra]) => [type, bufferReader[`read${type}`](...extra).toString(16), ...extra]);

tap.same(resultData, sourceData, "Round trip succeeded");
