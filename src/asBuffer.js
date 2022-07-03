export default function asBuffer(data) {
    if (typeof Buffer == "undefined") return data;
    if (data instanceof Buffer) return data;
    if (data.buffer) return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
    throw new Error("Unable to convert to buffer");
}
