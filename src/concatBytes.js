export default function concatBytes(...arrays) {
    let result = new Uint8Array(arrays.reduce((length, array) => length + array.length, 0));
    let index = 0;
    for (let array of arrays) {
        result.set(array, index);
        index += array.length;
    }
    return result;
};
