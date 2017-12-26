const CreatingMap = require('./CreatingMap');

class OverflowError extends Error {
}

module.exports = class BufferReader {
    constructor(uint8array, start=0, end=uint8array.byteLength, regions=new CreatingMap(()=>new ReaderRegion())) {
        Object.assign(this,{uint8array,end,start,regions});
        this.dataView = new DataView(this.uint8array.buffer, uint8array.byteOffset, uint8array.byteLength);
        this.index=start;
    }

    clone() {
        return new BufferReader(this.uint8array,this.index,this.end,this.regions);
    }

    getRegion(name) {
        return this.regions.get(name);
    }

    getReadSize() {
        return this.index-this.start;
    }

    setSize(size) {
        this.end=this.start+size;
        this.eat(0);
    }

    eof() {
        return this.index >= this.end;
    }

    eat(size) {
        let index = this.index;
        this.index += size;
        if (this.index>this.end) {
            throw new OverflowError();
        }
        return index;
    }

    readU64BE(value) {
        let index=this.eat(8);
        return this.dataView.getUint32(index)*2**32+this.dataView.getUint32(index+4);
    }

    readU32BE() {
        return this.dataView.getUint32(this.eat(4));
    }

    readU24BE() {
        return (this.dataView.getUint8(this.eat(1)) << 16)+this.dataView.getUint16(this.eat(2));
    }

    readU16BE() {
        return this.dataView.getUint16(this.eat(2));
    }

    readU8() {
        return this.dataView.getUint8(this.eat(1));
    }



    readBytes(size=this.end-this.index) {
        return this.uint8array.slice(this.eat(size),this.index);
    }

}
