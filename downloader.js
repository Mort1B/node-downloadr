const fs = require("fs");
const base64url = require("base64url");
const undici = require("undici");
var argv = require('yargs').options({
    transaction: {
        alias: 'tx',
        describe: 'transaction address',
        demandOption: true,
        requiresArg: true,
        type: 'string',
    }, output: {
        describe: 'output file path',
        demandOption: true,
        requiresArg: true,
        type: 'string'
    }
}).help().argv


const getTxOffsetData = async (tx) => {
  const { body } = await undici.request(`https://arweave.net/tx/${tx}/offset`);
  return body
    .json()
    .then((value) => {
      return value;
    })
    .catch((e) => console.error("Error getting transaction offset, make sure inputs are correct and try again ", e));
};

const getAndDecodeChunkData = async (offset) => {
  const { body } = await undici.request(`https://arweave.net/chunk/${offset}`);
  return body
    .json()
    .then((value) => {
      return base64url.toBuffer(value.chunk);
    })
    .catch((e) => console.error("Error getting chunk data ", e));
};


// There are two ways of doing this, either(1) by starting at the size/ length of the buffer we are given from calling the
// getAndDecodeChunkData function and subtracting the length/size of each vector of bytes until we reach offset - size.
// The other way(2) is by subtracting the size before the loop and adding the length/size of each vector of bytes until we reach the
// end_offset.
// By commenting *in* line 67-77 and commenting *out* line 54-65 you can run the code that does it the second way(2).
const writeToFile = async (tx) => {
  const result = await getTxOffsetData(tx);
  const size = parseInt(result.size);
  const offset = parseInt(result.offset);
  const offsetStart = offset - size + 1;

  const data = new Uint8Array(size);

  let chunk = offset;

  while (chunk > offsetStart) {
    const chunkData = await getAndDecodeChunkData(chunk);

    if (chunkData) {
        data.set(chunkData, offset - chunk);
        chunk -= chunkData.length;
    } else {
        throw new Error(`Error - cannot find chunk data, make sure input is correct and try again`)
    }
  }

//   for(let byte = 0; byte < size; byte) {
//     const chunkData = await getAndDecodeChunkData(offsetStart + byte);
//
//     if (chunkData) {
//         data.set(chunkData, byte);
//         byte += chunkData.length;
//     } else {
//         throw new Error(`Error at ${byte}/${size}`);
//     }
//     console.log(Math.trunc(100 * byte / size), '%');
//   }

  fs.writeFile(`./${argv.output}`, data, (e) => {
    if (e) return console.error("Error writing to file: ", e);
  });
};

writeToFile(argv.tx);
