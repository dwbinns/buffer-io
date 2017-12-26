function asDataView(uint8array) {
    return new DataView(uint8array.buffer, uint8array.byteOffset, uint8array.byteLength);
}

module.exports = class ResizableBuffer {
    constructor(initialCapacity=256) {
        this.get(initialCapacity);
    }

    get(length) {
        let priorLength = this.uint8array ? this.uint8array.length : 0;
        if (length>priorLength) {
            let uint8array = new Uint8Array(Math.max(length,priorLength*2));
            if (priorLength) uint8array.set(this.uint8array);
            this.uint8array=uint8array;
            this.dataView = asDataView(this.uint8array);
        }
        return this;
    }

    trim(size) {
        this.uint8array = this.uint8array.subarray(size);
        this.dataView = asDataView(this.uint8array);
    }

}
