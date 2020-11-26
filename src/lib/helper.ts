const serializeBigInt = function (i: number) {
    const view = new DataView(new ArrayBuffer(8));
    view.setUint32(0, i, true);
    return view.buffer;
}

const toBigUInt64LE = function (num:number | bigint) {
    const bnum = BigInt(num);
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64LE(bnum);
    return `0x${buf.toString("hex")}`;
}

export {
    serializeBigInt,
    toBigUInt64LE
}