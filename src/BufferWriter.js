import ResizableBuffer from './ResizableBuffer.js';
import asBuffer from './asBuffer.js';


export default class BufferWriter {
    constructor(resizableBuffer = new ResizableBuffer(), start = 0, context = {}, settings = { littleEndian: false }) {
        this.resizableBuffer = resizableBuffer;
        this.start = start;
        this.index = start;
        this.context = { ...context };
        this.settings = { ...settings };
    }

    configure(settings) {
        Object.assign(this.settings, settings);
        return this;
    }

    here() {
        return new BufferWriter(this.resizableBuffer, this.index, this.context, this.settings);
    }

    getSize() {
        return this.index - this.start;
    }

    align(size) {
        this.skip((size - this.index % size) % size);
    }

    ensure(size, align) {
        if (this.settings.align && align) {
            this.align(size);
        }
        return this.resizableBuffer.get(size + this.index);
    }

    writeU8(value) {
        this.ensure(1).dataView.setUint8(this.index, value);
        this.index += 1;
    }

    writeU16(value, littleEndian = this.settings.littleEndian) {
        this.ensure(2, true).dataView.setUint16(this.index, value, littleEndian);
        this.index += 2;
    }

    writeU24(value, littleEndian = this.settings.littleEndian) {
        let dataView = this.ensure(3).dataView;
        if (littleEndian) {
            dataView.setUint16(this.index, value & 0xffff, true);
            dataView.setUint8(this.index + 2, value >> 16);
        } else {
            dataView.setUint8(this.index, value >> 16);
            dataView.setUint16(this.index + 1, value & 0xffff);
        }
        this.index += 3;
    }

    writeU32(value, littleEndian = this.settings.littleEndian) {
        let dataView = this.ensure(4, true).dataView;
        dataView.setUint32(this.index, value, littleEndian);
        this.index += 4;
    }

    writeS32(value, littleEndian = this.settings.littleEndian) {
        let dataView = this.ensure(4, true).dataView;
        dataView.setInt32(this.index, value, littleEndian);
        this.index += 4;
    }

    writeU64big(value, littleEndian = this.settings.littleEndian) {
        let dataView = this.ensure(8, true).dataView;
        dataView.setBigUint64(this.index, value, littleEndian);
        this.index += 8;
    }


    writeBytes(uint8array) {
        this.ensure(uint8array.byteLength).uint8array.set(uint8array, this.index);
        this.index += uint8array.length;
    }

    writeCString(text) {
        this.writeBytes(new TextEncoder().encode(text));
        this.writeU8(0);
    }

    skip(count) {
        this.index += count;
    }

    padAlign(alignment) {
        this.index += alignment - ((index + alignment - 1) % alignment) - 1;
    }

    getUint8Array() {
        return this.resizableBuffer.uint8array.subarray(this.start, this.index);
    }

    getBuffer() {
        return asBuffer(this.getUint8Array());
    }
}
