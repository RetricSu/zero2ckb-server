import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const serializeBigInt = function (i: number) {
  const view = new DataView(new ArrayBuffer(8));
  view.setUint32(0, i, true);
  return view.buffer;
};

const toBigUInt64LE = function (num: number | bigint) {
  const bnum = BigInt(num);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64LE(bnum);
  return `0x${buf.toString("hex")}`;
};

const buf2hex = function (buffer: ArrayBuffer) {
  // buffer is an ArrayBuffer
  return Array.prototype.map
    .call(new Uint8Array(buffer), (x) => ("00" + x.toString(16)).slice(-2))
    .join("");
};

export { serializeBigInt, toBigUInt64LE, buf2hex };
