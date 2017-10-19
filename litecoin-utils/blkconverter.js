'use strict';

// execution
// node ./litecoin-utils/blkconverter.js

// convert block json from litecoind format to litecore format

// get ./litecoin-utils/inputs/blk400000.dat by:
// curl 127.0.0.1:9332/rest/block/1950dad9ef32cf5635202ccd9edd78b58a4cb3a945aa0a88e1960f9f9b7616d8.hex | xxd -r -p > ./litecoin-utils/inputs/blk400000.dat

// get ./litecoin-utils/inputs/blk400000.json by
// curl 127.0.0.1:9332/rest/block/1950dad9ef32cf5635202ccd9edd78b58a4cb3a945aa0a88e1960f9f9b7616d8.json > ./litecoin-utils/inputs/blk400000.json

// get ./litecoin-utils/inputs/blk400000.js by manually edit the file

// Manually check if blk400000-litecore.json match with blk400000.json

var bitcore = require('..');
var Block = bitcore.Block;
var fs = require('fs');

var first8Bytes = new Buffer ([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]); // won't be used in block allocation, just fill with some inane values

var blockBuffer = fs.readFileSync('litecoin-utils/inputs/blk400000.dat');

var litecoreFormatBlockBuffer = Buffer.concat([first8Bytes, blockBuffer]);

var blk = Block.fromRawBlock(litecoreFormatBlockBuffer);

var blkJSON = blk.toJSON();
var blkJSONStr = JSON.stringify(blkJSON, null, 2);

fs.writeFileSync('litecoin-utils/outputs/blk400000-litecore.dat', litecoreFormatBlockBuffer);
fs.writeFileSync('litecoin-utils/outputs/blk400000-litecore.json', blkJSONStr);
