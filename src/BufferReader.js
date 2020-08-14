const CreatingMap = require('./CreatingMap');
const { TextDecoder } = require('util');
const OverflowError = require('./OverflowError');

module.exports = class BufferReader {
    constructor(uint8array, start=0, end=uint8array.byteLength, context = {}, settings = {littleEndian: false}, name = "") {
        this.uint8array = uint8array;
        this.start = start;
        this.end = end;
        this.dataView = new DataView(this.uint8array.buffer, uint8array.byteOffset, uint8array.byteLength);
        this.index=start;
        this.settings = {...settings};
        this.context = {...context};
        this.name = name;
    }

    configure(settings) {
        Object.assign(this.settings, settings);
        return this;
    }

    subReader(name = this.name) {
        return new BufferReader(this.uint8array, this.index, this.end, this.context, this.settings, name);
    }

    getReadSize() {
        return this.index - this.start;
    }

    getRemainingSize() {
        return this.end - this.index;
    }

    setSize(size) {
        this.end = this.start + size;
        this.eat(0);
    }

    eof() {
        return this.index >= this.end;
    }

    align(size) {
        this.index += (size - this.index % size) % size;
    }

    eat(size, align) {
        if (this.settings.align && align) {
            this.align(size);
        }
    }

    eatAll() {
        this.index = this.end;
    }


    eat(size, align) {
        if (this.settings.align && align) {
            this.align(size);
        }

        let index = this.index;
        this.index += size;
        if (this.index > this.end) {
            throw new OverflowError("Read beyond end");
        }
        return index;
    }

    readU64big(littleEndian = this.settings.littleEndian) {
        let index=this.eat(8, true);
        if (littleEndian) return BigInt(this.dataView.getUint32(index, true))+(BigInt(this.dataView.getUint32(index+4, true))<<32n);
        else return (BigInt(this.dataView.getUint32(index))<<32n)+BigInt(this.dataView.getUint32(index+4));
    }

    readU32(littleEndian = this.settings.littleEndian) {
        return this.dataView.getUint32(this.eat(4, true), littleEndian);
    }

    readU24(littleEndian = this.settings.littleEndian) {
        if (littleEndian) return this.dataView.getUint16(this.eat(2), true) + (this.dataView.getUint8(this.eat(1)) << 16);
        else return (this.dataView.getUint8(this.eat(1)) << 16)+this.dataView.getUint16(this.eat(2));
    }

    readU16(littleEndian = this.settings.littleEndian) {

        return this.dataView.getUint16(this.eat(2, true), littleEndian);
    }

    readU8() {
        return this.dataView.getUint8(this.eat(1));
    }

    readCString() {
        let end = this.uint8array.indexOf(0, this.index);
        if (end < 0) throw new OverflowError();
        let size = end - this.index;
        let result = new TextDecoder().decode(this.readBytes(size));
        this.eat(1);
        return result;
    }

    readBytes(size = this.end - this.index) {
        return this.uint8array.slice(this.eat(size), this.index);
    }

}
