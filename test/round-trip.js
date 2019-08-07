const tap = require('tap');
const {BufferReader, BufferWriter} = require('..');

const testData = [
    ['U64big',0x0123456789ABCDEFn],
    ['U32',0x23456789],
    ['U24',0x334455],
    ['U16',0x1122],
    ['U8',0x78],
    ['Bytes',Uint8Array.of(50,60,70)],
];

for (let littleEndian of [false, true]) {
    let bufferWriter = new BufferWriter().configure({littleEndian});

    testData.forEach(([type, value]) => bufferWriter[`write${type}`](value));

    let bufferReader = new BufferReader(bufferWriter.getUint8Array()).configure({littleEndian});

    let sourceData = testData.map(([type, value]) => [type, value.toString(16)]);
    let resultData = testData.map(([type, value]) => [type, bufferReader[`read${type}`]().toString(16)]);
    tap.same(resultData, sourceData, `Round trip succeeded: ${littleEndian ? "little" : "big"}Endian`);
}


