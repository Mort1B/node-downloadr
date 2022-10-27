node-downloadr

download arweave tx-data in js by splitting it up in chunks of data, appending them to an array and priting to file

### some "benchmarking"

| Method         | Debug build                                              |
|:--------------:|:--------------------------------------------------------:|
| fs.writeFile(1)| 81s - 11s - 82s - 11s - 11s - 11s - 11s - 11s - 11s - 11s|
| fs.writeFile(2)| 93s - 11s - 11s - 11s - 11s - 11s - 11s - 11s - 12s - 11s|

Method 1 starts with final tx in a chunk, method 2 starts with first tx in a chunk.
"benchmarking" was done by fetching tx: BfOtg-A5EP8RmPQwa7V-fRORQFdUlAM6OYARwori_qE, writing to file "bas.txt" and priting elapsed time to run program.

To run:

***$ npm install***

***$ node downloader.js --transaction <tx_id> --output <file_name>***

Example:

***$ npm install***

***$ node downloader.js --transaction "K9u_6E9tO8yr6Jx1D_lHz2tRhSIThPrXpmgazFw8BWI" --output "./bas.txt"***
