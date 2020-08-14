# JavaScript Buffer IO #
Reader and writer for Node [buffer](https://nodejs.org/api/buffer.html)s and [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)s

## Usage ##

```
npm install buffer-io
```

```JavaScript
const {BufferReader, BufferWriter} = require('buffer-io');
const data = 0x12345678;
let bufferWriter = new BufferWriter();
bufferWriter.writeU32(0x12345678);
let bufferReader = new BufferReader(bufferWriter.getUint8Array());
bufferReader.readU32() == data;
```

## Tests ##
run:
```
npm test
```
