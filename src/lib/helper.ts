const serializeBigInt = function (i: number) {
    const view = new DataView(new ArrayBuffer(8));
    view.setUint32(0, i, true);
    return view.buffer;
}

export {
    serializeBigInt
}