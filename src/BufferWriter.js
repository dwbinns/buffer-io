const ResizableBuffer = require('./ResizableBuffer');
const asBuffer = require('./asBuffer');
const {TextEncoder} = require("util");

module.exports = class BufferWriter {
    constructor(resizableBuffer=new ResizableBuffer(), start=0, scope = new Map(), settings = {}) {
        Object.assign(this, {resizableBuffer, start, scope});
        this.index=start;
        this.settings={...settings};
    }


    subWriter() {
        return new BufferWriter(this.resizableBuffer, this.index, this.scope, this.settings);
    }

    getSize() {
        return this.index-this.start;
    }

    align(size) {
        this.skip((size - this.index % size) % size);
    }

    ensure(size, align) {
        if (this.settings.align && align) {
            this.align(size);
        }
        return this.resizableBuffer.get(size+this.index);
    }

    writeU8(value) {
        this.ensure(1).dataView.setUint8(this.index, value);
        this.index+=1;
    }

    writeU16(value, littleEndian) {
        this.ensure(2, true).dataView.setUint16(this.index, value, littleEndian);
        this.index+=2;
    }

    writeU24(value, littleEndian) {
        let dataView=this.ensure(3).dataView;
        if (littleEndian) {
            dataView.setUint16(this.index, value & 0xffff, true);
            dataView.setUint8(this.index+2, value>>16);
        } else {
            dataView.setUint8(this.index, value>>16);
            dataView.setUint16(this.index+1, value & 0xffff);
        }
        this.index+=3;
    }

    writeU32(value, littleEndian) {
        let dataView = this.ensure(4, true).dataView;
        dataView.setUint32(this.index, value, littleEndian);
        this.index+=4;
    }

    writeU64big(value, littleEndian) {
        let dataView = this.ensure(8, true).dataView;
        dataView.setBigUint64(this.index, value, littleEndian);
        this.index += 8;
    }

    writeU64(value, littleEndian) {
        this.writeU64big(new BigInt(value), littleEndian);
    }

    writeBytes(uint8array) {
        this.ensure(uint8array.byteLength).uint8array.set(uint8array, this.index);
        this.index+=uint8array.length;
    }

    writeCString(text) {
        this.writeBytes(new TextEncoder().encode(text));
        this.writeU8(0);
    }

    skip(count) {
        this.index+=count;
    }

    padAlign(alignment) {
        this.index += alignment - ((index+alignment-1) % alignment)-1;
    }

    getUint8Array() {
        return this.resizableBuffer.uint8array.subarray(this.start, this.index);
    }

    getBuffer() {
        return asBuffer(this.getUint8Array());
    }
}
