
import OverflowError from './OverflowError.js';

export default class BufferReader {
    constructor(uint8array, start = 0, end = uint8array.byteLength, context = {}, settings = { littleEndian: false, failSilent: false }, name = "") {
        this.uint8array = uint8array;
        this.start = start;
        this.end = end;
        this.dataView = new DataView(this.uint8array.buffer, uint8array.byteOffset, uint8array.byteLength);
        this.index = start;
        this.settings = { ...settings };
        this.context = { ...context };
        this.name = name;
    }

    configure(settings) {
        Object.assign(this.settings, settings);
        return this;
    }

    setContext(key, value) {
        this.context[key] = value;
        return this;
    }

    getContext(key) {
        return this.context[key];
    }

    here(name = this.name) {
        return new BufferReader(this.uint8array, this.index, this.end, this.context, this.settings, name);
    }

    nest(callback) {
        let nested = this.here();
        let result = callback(nested);
        this.eat(nested.getReadSize());
        return result;
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

    eatAll() {
        this.index = this.end;
    }


    eat(size, align) {
        if (this.settings.align && align) {
            this.align(size);
        }

        let index = this.index;
        if (this.index + size > this.end) {
            this.index = this.end;
            if (this.settings.failSilent) return null;
            throw new OverflowError("Read beyond end");
        }
        this.index += size;
        return index;
    }

    readU64big(littleEndian = this.settings.littleEndian) {
        let index = this.eat(8, true);
        if (index == null) return null;
        if (littleEndian) return BigInt(this.dataView.getUint32(index, true)) + (BigInt(this.dataView.getUint32(index + 4, true)) << 32n);
        else return (BigInt(this.dataView.getUint32(index)) << 32n) + BigInt(this.dataView.getUint32(index + 4));
    }

    readU32(littleEndian = this.settings.littleEndian) {
        let index = this.eat(4, true);
        if (index == null) return null;
        return this.dataView.getUint32(index, littleEndian);
    }

    readS32(littleEndian = this.settings.littleEndian) {
        let index = this.eat(4, true);
        if (index == null) return null;
        return this.dataView.getInt32(index, littleEndian);
    }

    readU24(littleEndian = this.settings.littleEndian) {
        let index = this.eat(3);
        if (index == null) return null;
        if (littleEndian) return this.dataView.getUint16(index, true) + (this.dataView.getUint8(index + 2) << 16);
        else return (this.dataView.getUint8(index) << 16) + this.dataView.getUint16(index + 1);
    }

    readU16(littleEndian = this.settings.littleEndian) {
        let index = this.eat(2, true);
        if (index == null) return null;
        return this.dataView.getUint16(index, littleEndian);
    }

    readU8() {
        let index = this.eat(1, true);
        if (index == null) return null;
        return this.dataView.getUint8(index);
    }

    readCString() {
        return new TextDecoder().decode(this.readDelimited(0));
    }

    readDelimited(terminal) {
        let end = this.uint8array.indexOf(terminal, this.index);
        if (end < 0) throw new OverflowError();
        let size = end - this.index;
        let result = this.readBytes(size);
        this.eat(1);
        return result;
    }

    readBytes(size = this.end - this.index) {
        let index = this.eat(size);
        if (index == null) return null;
        return this.uint8array.slice(index, this.index);
    }

}
