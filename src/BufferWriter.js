const ResizableBuffer = require('./ResizableBuffer');
const CreatingMap = require('./CreatingMap');
const asBuffer = require('./asBuffer');

module.exports = class BufferWriter {
    constructor(resizableBuffer=new ResizableBuffer(), start=0, regions=new CreatingMap(()=>new WriterRegion())) {
        Object.assign(this, {resizableBuffer, start, regions});
        this.index=start;
    }

    subWriter() {
        return new BufferWriter(this.resizableBuffer, this.index, this.regions);
    }

    getSize() {
        return this.index-this.start;
    }

    getRegion(name) {
        return this.regions.get(name);
    }

    ensure(size) {
        return this.resizableBuffer.get(size+this.index);
    }

    writeU8(value) {
        this.ensure(1).dataView.setUint8(this.index, value);
        this.index+=1;
    }

    writeU16BE(value) {
        this.ensure(2).dataView.setUint16(this.index, value);
        this.index+=2;
    }

    writeU24BE(value) {
        let dataView=this.ensure(3).dataView;
        dataView.setUint8(this.index, value>>16);
        dataView.setUint16(this.index+1, value & 0xffff);
        this.index+=3;
    }

    writeU32BE(value) {
        let dataView = this.ensure(4).dataView;
        dataView.setUint32(this.index, value);
        this.index+=4;
    }

    writeU64BE(value) {
        let dataView = this.ensure(8).dataView;
        dataView.setUint32(this.index, Math.floor(value / 2**32)>>>0);
        dataView.setUint32(this.index+4, value>>>0);
        this.index+=8;
    }

    writeBytes(uint8array) {
        this.ensure(uint8array.byteLength).uint8array.set(uint8array, this.index);
        this.index+=uint8array.length;
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
