module.exports = function toHex(uint8array, lineFeed='') {
    //return uint8array.toString("hex");
    return `[${uint8array.length}]`+[...uint8array].map(v=>('00'+v.toString(16)).slice(-2)).join(':')/*.match(/(..:?){1,16}/g).join(lineFeed)*/;
}
