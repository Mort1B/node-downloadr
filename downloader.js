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

const writeToFile = async (tx) => {
  const result = await getTxOffsetData(tx);
  const size = parseInt(result.size);
  const offset = parseInt(result.offset);
  const offsetStart = offset - size + 1;

  const data = new Uint8Array(size);

  for(let byte = 0; byte < size; byte) {
    const chunkData = await getAndDecodeChunkData(offsetStart + byte);
    
    if (chunkData) {
        data.set(chunkData, byte);
        byte += chunkData.length;
    } else {
        throw new Error(`Error at ${byte}/${size}`);
    }
    console.log(Math.trunc(100 * byte / size), '%');
  }

  fs.writeFile(`./${argv.output}`, data, (e) => {
    if (e) return console.error("Error writing to file: ", e);
  });
};

writeToFile(argv.tx);
