// const SIG_CEN: Uint8Array = new TextEncoder().encode('PK\x01\x02');
const SIG_EOCD: Uint8Array = new TextEncoder().encode('PK\x05\x06');

const fixupZip = (
    zipData: Uint8Array,
    insertOffset: number
): Uint8Array => {
    // const posCen: number = findSignature(zipData, SIG_CEN);
    const posEocd: number = findSignature(zipData, SIG_EOCD);
    const posCen: number = readUint32(zipData, posEocd + 16);
    if (posCen === -1 || posEocd === -1 || posEocd <= posCen) {
        throw new Error("Invalid ZIP file.");
    }
    const sizeCen: number = readUint32(zipData, posEocd + 12);
    const zipBytes: Uint8Array = new Uint8Array(zipData);
    let size: number = 0;

    while (size < sizeCen) {
        const position: number = posCen + size;
        if (position + 46 > zipBytes.length) {
            throw new Error("Invalid ZIP central directory entry.");
        }

        const loc: number = readUint32(zipBytes, position + 42) + insertOffset;
        writeUint32(zipBytes, position + 42, loc);

        const filenameLength: number = readUint16(zipBytes, position + 28);
        const extraLength: number = readUint16(zipBytes, position + 30);
        const commentLength: number = readUint16(zipBytes, position + 32);

        size += 46 + filenameLength + extraLength + commentLength;
    }

    const zipOffset: number = posCen + insertOffset;
    writeUint32(zipBytes, posEocd + 16, zipOffset);

    return zipBytes;
};

const findSignature = (
    data: Uint8Array,
    signature: Uint8Array
): number => {
    for (let i = data.length - signature.length; i >= 0; i--) {
        let found: boolean = true;
        for (let j = 0; j < signature.length; j++) {
            if (data[i + j] !== signature[j]) {
                found = false;
                break;
            }
        }
        if (found) {
            return i;
        }
    }
    return -1;
};

const readUint32 = (
    data: Uint8Array,
    offset: number
): number => {
    return (
        (data[offset] << 0) |
        (data[offset + 1] << 8) |
        (data[offset + 2] << 16) |
        (data[offset + 3] << 24)
    );
};

const writeUint32 = (
    data: Uint8Array,
    offset: number,
    value: number
): void => {
    data[offset] = value & 0xff;
    data[offset + 1] = (value >> 8) & 0xff;
    data[offset + 2] = (value >> 16) & 0xff;
    data[offset + 3] = (value >> 24) & 0xff;
};

const readUint16 = (
    data: Uint8Array,
    offset: number
): number => {
    return (data[offset] << 0) | (data[offset + 1] << 8);
};

export default fixupZip;
