export default function toHex(uint8array, byteSeparator = ":") {
    return [...uint8array].map(v => v.toString(16).padStart(2, '0')).join(byteSeparator);
}
