'use strict';

var bitcore = require('../..');
var BN = require('../../lib/crypto/bn');
var BufferReader = bitcore.encoding.BufferReader;
var BufferWriter = bitcore.encoding.BufferWriter;
var BlockHeader = bitcore.BlockHeader;
var Block = bitcore.Block;
var chai = require('chai');
var fs = require('fs');
var should = chai.should();
var Transaction = bitcore.Transaction;

// https://test-insight.bitpay.com/block/000000000b99b16390660d79fcc138d2ad0c89a0d044c4201a02bdf1f61ffa11
var dataRawBlockBuffer = fs.readFileSync('litecoin-utils/outputs/blk400000-litecore.dat');
var dataRawBlockBinary = fs.readFileSync('litecoin-utils/outputs/blk400000-litecore.dat', 'binary');
var dataJson = fs.readFileSync('litecoin-utils/outputs/blk400000-litecore.json').toString();
var data = require('../../litecoin-utils/inputs/blk400000');
var dataBlocks = require('../data/bitcoind/blocks');

describe('Block', function() {

  var blockhex = data.blockhex;
  var blockbuf = new Buffer(blockhex, 'hex');
  var bh = BlockHeader.fromBuffer(new Buffer(data.blockheaderhex, 'hex'));
  var txs = [];
  JSON.parse(dataJson).transactions.forEach(function(tx) {
    txs.push(new Transaction().fromObject(tx));
  });
  var json = dataJson;

  var genesishex = '010000000000000000000000000000000000000000000000000000000000000000000000d9ced4ed1130f7b7faad9be25323ffafa33232a17c3edf6cfd97bee6bafbdd97b9aa8e4ef0ff0f1ecd513f7c0101000000010000000000000000000000000000000000000000000000000000000000000000ffffffff4804ffff001d0104404e592054696d65732030352f4f63742f32303131205374657665204a6f62732c204170706c65e280997320566973696f6e6172792c2044696573206174203536ffffffff0100f2052a010000004341040184710fa689ad5023690c80f3a49c8f13f8d45b8c857fbcbc8bc4a8e4d3eb4b10f4d4604fa08dce601aaf0f470216fe1b51850b4acf21b179c45070ac7b03a9ac00000000';
  var genesisbuf = new Buffer(genesishex, 'hex');
  var genesisidhex = '12a765e31ffd4059bada1e25190f6e98c99d9714d334efa41a195a7e7e04bfe2';
  var blockOneHex = '01000000e2bf047e7e5a191aa4ef34d314979dc9986e0f19251edaba5940fd1fe365a712f6509b1757baa71bc746e17cb4d0ed22e8935f71e2d0724336789021a40639fabfed8f4ef0ff0f1e7f2704000101000000010000000000000000000000000000000000000000000000000000000000000000ffffffff07045dec8f4e0102ffffffff0100f2052a01000000434104284464458f95a72e610ecd7a561e8c2bdb46c491b347e4a375aa8f2e3b3ed56e99552e789265b6e52a2fc9a00edcdd6c032979dd81a7f1201b62427076768a7aac00000000';
  var blockOneBuf = new Buffer(blockOneHex, 'hex');
  var blockOneId = '80ca095ed10b02e53d769eb6eaf92cd04e9e0759e5be4a8477b42911ba49c78f';

  it('should make a new block', function() {
    var b = Block(blockbuf);
    b.toBuffer().toString('hex').should.equal(blockhex);
  });

  it('should not make an empty block', function() {
    (function() {
      return new Block();
    }).should.throw('Unrecognized argument for Block');
  });

  describe('#constructor', function() {

    it('should set these known values', function() {
      var b = new Block({
        header: bh,
        transactions: txs
      });
      should.exist(b.header);
      should.exist(b.transactions);
    });

    it('should properly deserialize blocks', function() {
      dataBlocks.forEach(function(block) {
        var b = Block.fromBuffer(new Buffer(block.data, 'hex'));
        b.transactions.length.should.equal(block.transactions);
      });
    });

  });

  describe('#fromRawBlock', function() {

    it('should instantiate from a raw block binary', function() {
      var x = Block.fromRawBlock(dataRawBlockBinary);
      x.header.version.should.equal(2);
      new BN(x.header.bits).toString('hex').should.equal('1b4fbbc7');
    });

    it('should instantiate from raw block buffer', function() {
      var x = Block.fromRawBlock(dataRawBlockBuffer);
      x.header.version.should.equal(2);
      new BN(x.header.bits).toString('hex').should.equal('1b4fbbc7');
    });

  });

  describe('#fromJSON', function() {

    it('should set these known values', function() {
      var block = Block.fromObject(JSON.parse(json));
      should.exist(block.header);
      should.exist(block.transactions);
    });

    it('should set these known values', function() {
      var block = new Block(JSON.parse(json));
      should.exist(block.header);
      should.exist(block.transactions);
    });

  });

  describe('#toJSON', function() {

    it('should recover these known values', function() {
      var block = Block.fromObject(JSON.parse(json));
      var b = block.toJSON();
      should.exist(b.header);
      should.exist(b.transactions);
    });

  });

  describe('#fromString/#toString', function() {

    it('should output/input a block hex string', function() {
      var b = Block.fromString(blockhex);
      b.toString().should.equal(blockhex);
    });

  });

  describe('#fromBuffer', function() {

    it('should make a block from this known buffer', function() {
      var block = Block.fromBuffer(blockbuf);
      block.toBuffer().toString('hex').should.equal(blockhex);
    });

    it('should instantiate from block buffer from the network', function() {
      var networkBlock = '020000009112eb62792ea01f5ae9b4179b5c94713709e98acc0918255f8499dc85a57236150a28f1e83ad2da82bf9aad3f0a6a06c6e6e4e8ac84a93ea5365a21363de0381744fd51c7bb4f1b007b177a0301000000010000000000000000000000000000000000000000000000000000000000000000ffffffff2703801a06062f503253482f041344fd5108f807570a070000000d2f7374726174756d506f6f6c2f0000000001d0ed072a010000001976a914b453bb7034ca1d997560c732a18b7b90f68c4a7488ac000000000100000001572b6e4e9578d2c23236ff81f0b94d97aa74519b2f76feb48db34f23ad0525ba000000006a47304402200b32701a1eaab8f3aa92463923c5bac5d079e5e546739d8b3a407145fc35b5b102200b7b1015afdc95b144b546c7abc25a3eef14a9ec8cbc4d13f47af31ac7f02ed301210216c5ae13f7659b5500e7e393ec3aee655e6c68ed2d499cef95fbbad3db80d0ffffffffff02d3336a660c0000001976a914258312f92edba058ee749e5d1fbdef37e1d1c90588accd3a1071010000001976a914705c059c4213ffa9d92308601de26b90cdf129c488ac000000000100000013079da98c801858f5b3a245f3d7b1a0fa20683fd42fdfc7290e59f6593efc373f140100006c493046022100a2bb48b40fa1b63830ff38fca50d76455e6fc1271f02f9b0b35d29874ff35390022100c55315248ebd0d59c98038990d251f242e9b2d6f3cc3ea6a8468f11540cf51c70121038480dd88384a5aecf2bdcb8d700d5d505710d34a8568c50417f645e773cf5e56ffffffff01d584090e145cd179c2368b8d5d7cb8c523d6f7c4e191537eb1d54001b9dc4c000000006b483045022100c921626f7960d7bf7270a925756a9cd3969451aa0d4ce1598573a1386e4552500220134abcb7036fc7f46d2476c20cd9a0a0b841d2100ce442321776be7089c598df0121038480dd88384a5aecf2bdcb8d700d5d505710d34a8568c50417f645e773cf5e56ffffffff1f6fb36a610e2f5c976330adafe508d62f250f3077210f5b557056311e1ae1de110000006b4830450220461ee40bc5c4125cb7d8ada0985f118441513aa5ad8d6bd41a5d5545dce34c0c0221009eae1c7869aeefb10949b784f915b35fdd2182c33ba213640eb71db1293bcfe50121038480dd88384a5aecf2bdcb8d700d5d505710d34a8568c50417f645e773cf5e56ffffffff22df8b15f11a74208ba869811859576c6a6af073ba34ad1b0e0a453f3358790c140000006a47304402207481c56cbe726563e701214a460a5eefe90a36a7f6ca6748a5bacd644259a71502205fa5a31db5ff1d6548208d6a8ed6a17dba10afcea7a50e3f5217563d6e6849090121038480dd88384a5aecf2bdcb8d700d5d505710d34a8568c50417f645e773cf5e56ffffffffd68c8776e0c62d14ead334e5e73325c4af22a0caa7536f80049839400ab950e0110000006b483045022100b5d2abd0b920b769c8c9d4ced0be164c8b92cb5319e5182a732243f5776e9f85022065f5262c8b92b2479b16db9574a39302e733ca5c7d300dca76259c44f093804e0121038480dd88384a5aecf2bdcb8d700d5d505710d34a8568c50417f645e773cf5e56ffffffffe97a07e439bf1cac2db36f49dfef2851823dc3fcbb18cb17841ff57b38df2d1a060000006a47304402202119b89c4905b9c2652710bfa7b4bddafbc48a028d3c26fd6dc8a5619fcec41f022038abc3710bb22119f7245d3e0a63485debe7d05da77132e041210b1eba8114bd0121038480dd88384a5aecf2bdcb8d700d5d505710d34a8568c50417f645e773cf5e56ffffffffeff0b07c6206b33bdfdbc5203dea03f2699ffa7912a4faba8e9ee39fad44e3ddbd0000006b483045022100fa94a7acd14fae43dbcf495cd3b9703707ceae38209fc6393d95ca693aa319c40220620d6b38aebf945e56c3500c554ed71dfd710794a769228b93e49d9a751cb50b0121038480dd88384a5aecf2bdcb8d700d5d505710d34a8568c50417f645e773cf5e56ffffffff6d6f7ee21e868a3b1520f3bc7da5dd71d0d9f16b5ae50550f47bf0f243db19aa000000006c4930460221008f464cb91e4f9ded90d5b2794ea40df2632c695e680908a5ccc0fe2cf3ef4efe022100d7dbc838f2d1f95a9ebd8bae02ddc46b37ff9fa7e91825f158301fa18ddd2bfe0121038480dd88384a5aecf2bdcb8d700d5d505710d34a8568c50417f645e773cf5e56ffffffff67d41a36e1de73413f384926614a6573c4929d20f8eb1d60de7fb8e1e9995c652d0000006c493046022100890f74766390f6c517957d4b366bc496e6acc7c20dfe87a05cd8712f1e2ac63b022100bd02d5eb37905fe951bf387c7074d91f1b7374b845b9b8bf232ec251f0695a4d0121038480dd88384a5aecf2bdcb8d700d5d505710d34a8568c50417f645e773cf5e56ffffffffa38b6478e22997c4462f6f3de7574eb1f072b10b07f994f8e884cdc556e361b3090000006a4730440220486bc2c0121743f20f3ccd95c65a9863074bd3469d9114c28289580296199b2602207f4284d957b6972d7d426a3da1eae7024067c398df0bb71d3eee4830226ecc380121038480dd88384a5aecf2bdcb8d700d5d505710d34a8568c50417f645e773cf5e56ffffffff75fbd8229143066cb09fc3b6caab16cd6383d0ab3d293f9ddced0383430da76f000000006b48304502206cae3ca11eb708e0d6da0eaa515d8a386b5f44f4fcea1d1a38701e975ad706a6022100e66d2a84c3b7ad7558a88ee444e3d872ae350a4494d4c9f13eee5329e39b427b0121038480dd88384a5aecf2bdcb8d700d5d505710d34a8568c50417f645e773cf5e56ffffffff7bbc8724321a41d415243d84a8a425b422e58d225be44694819f1fde8e08953e000000006b483045022100b4a5beb8932e9c325ef81cf330ec7dbe68473bb0caf192a0f6685fdff5cd305402204698102101e1b59f88b49bb25215d38f39c24a4ab55872d7b57fec5e80d8d7970121038480dd88384a5aecf2bdcb8d700d5d505710d34a8568c50417f645e773cf5e56ffffffff7f9e4c427a83cfde2db0e10dc68fcafe29663aaf71ae06224687f846626f4ccd130000006b483045022100876181b6177e970867f3edfd0274720aef9defdc47b8e03fde830e662e581e620220785effa5d629ca9be220495d8246650e282aed298b307e52c554ef9f6a1513e40121038480dd88384a5aecf2bdcb8d700d5d505710d34a8568c50417f645e773cf5e56ffffffff9e42c17ea776130e93f4ee089beebbe3b6c25d856fc9d9ab76c8dea22e8347a0150000006b483045022100b152df3db50908bbba9f972364580bd6326406069c9bb3c49a19d07c3d0a223c02201710fcbb1074b7a147784d09a58caebf5fe97a6f2053a9c39d1619e789ee06e10121038480dd88384a5aecf2bdcb8d700d5d505710d34a8568c50417f645e773cf5e56ffffffffb93ceaee68151c177d38a6cd700fe3efc81060484a496b8621527316a0dae4082b0000006a47304402207eba5defff736e5bfe1d17ab93c62ece168df480f22cca43b8b48a9fb3230101022043a47bbd0b7a2559e96439269921cc6c8c220aa94d5ed83fc648960bf0a90ccc0121038480dd88384a5aecf2bdcb8d700d5d505710d34a8568c50417f645e773cf5e56ffffffffccd238b1be1d3bb59bd76c54cc1ab68c6f868d39a39d9f43447b5bbdcb879ba4760000006b48304502205c4997e0e163379de5d030dbbc442267d0a45e9d5d1a1817c6e6b8977975c5ce022100c0c6791063a0547186e5d387317087724336f3d5739374501bfd67d1878940b60121038480dd88384a5aecf2bdcb8d700d5d505710d34a8568c50417f645e773cf5e56ffffffffcd5c001263943b664982cca7b6a4d91b2b94d670ade26fd2f7af172b27fe4ef2000000006b483045022100cafa5fd3e5802b168350d3488655802dba9494b376d690bda476257f2aface5f02205f398e3789c58fd6876e04eb9c3ae3d78a4889addbf6abb1c8135d98fabdb5ee0121038480dd88384a5aecf2bdcb8d700d5d505710d34a8568c50417f645e773cf5e56fffffffff027f690f168fbcecfee78b25284e88f149a4bc1e8eda0ea072cff33ae2e13c7bd0000006a473044022049f7534a84aeb97561bb69dcd323cb461195428f34cf1bc4e006f782d411faf902202cea49d2cb5b69f025d96218f4512c38e83d9292e417663ad4b886e7c79038000121038480dd88384a5aecf2bdcb8d700d5d505710d34a8568c50417f645e773cf5e56fffffffff83fd0318b54dfa4ccec4716b104fc675dda53c034dce3db02f5819482993455360000006a47304402206196c9bf7f44d9bdd0e36271f8f79c1026352248b462e29bd42e62546e93362402200d4519e2f4dd8d9df81d97aed36c743a388984f11e1be1fdbcb9272fa9f79e2f0121038480dd88384a5aecf2bdcb8d700d5d505710d34a8568c50417f645e773cf5e56ffffffff0166c56701000000001976a91469151e191ded265bf3b509a5e329c99eccbd771888ac00000000';
      var x = Block.fromBuffer(networkBlock);
      x.toBuffer().toString('hex').should.equal(networkBlock);
    });

  });

  describe('#fromBufferReader', function() {

    it('should make a block from this known buffer', function() {
      var block = Block.fromBufferReader(BufferReader(blockbuf));
      block.toBuffer().toString('hex').should.equal(blockhex);
    });

  });

  describe('#toBuffer', function() {

    it('should recover a block from this known buffer', function() {
      var block = Block.fromBuffer(blockbuf);
      block.toBuffer().toString('hex').should.equal(blockhex);
    });

  });

  describe('#toBufferWriter', function() {

    it('should recover a block from this known buffer', function() {
      var block = Block.fromBuffer(blockbuf);
      block.toBufferWriter().concat().toString('hex').should.equal(blockhex);
    });

    it('doesn\'t create a bufferWriter if one provided', function() {
      var writer = new BufferWriter();
      var block = Block.fromBuffer(blockbuf);
      block.toBufferWriter(writer).should.equal(writer);
    });

  });

  describe('#toObject', function() {

    it('should recover a block from genesis block buffer', function() {
      var block = Block.fromBuffer(blockOneBuf);
      block.id.should.equal(blockOneId);
      block.toObject().should.deep.equal({
        header: {
          hash: '80ca095ed10b02e53d769eb6eaf92cd04e9e0759e5be4a8477b42911ba49c78f',
          version: 1,
          prevHash: '12a765e31ffd4059bada1e25190f6e98c99d9714d334efa41a195a7e7e04bfe2',
          merkleRoot: 'fa3906a4219078364372d0e2715f93e822edd0b47ce146c71ba7ba57179b50f6',
          time: 1318055359,
          bits: 504365040,
          nonce: 272255
        },
        transactions: [{
          hash: 'fa3906a4219078364372d0e2715f93e822edd0b47ce146c71ba7ba57179b50f6',
          version: 1,
          inputs: [{
            prevTxId: '0000000000000000000000000000000000000000000000000000000000000000',
            outputIndex: 4294967295,
            sequenceNumber: 4294967295,
            script: '045dec8f4e0102'
          }],
          outputs: [{
            satoshis: 5000000000,
            script: '4104284464458f95a72e610ecd7a561e8c2bdb46c491b347e4a375aa8f2e3b3ed5' +
              '6e99552e789265b6e52a2fc9a00edcdd6c032979dd81a7f1201b62427076768a7aac'
          }],
          nLockTime: 0
        }]
      });
    });

    it('roundtrips correctly', function() {
      var block = Block.fromBuffer(blockOneBuf);
      var obj = block.toObject();
      var block2 = Block.fromObject(obj);
      block2.toObject().should.deep.equal(block.toObject());
    });

  });

  describe('#_getHash', function() {

    it('should return the correct hash of the genesis block', function() {
      var block = Block.fromBuffer(genesisbuf);
      var blockhash = new Buffer(Array.apply([], new Buffer(genesisidhex, 'hex')).reverse());
      block._getHash().toString('hex').should.equal(blockhash.toString('hex'));
    });
  });

  describe('#id', function() {

    it('should return the correct id of the genesis block', function() {
      var block = Block.fromBuffer(genesisbuf);
      block.id.should.equal(genesisidhex);
    });
    it('"hash" should be the same as "id"', function() {
      var block = Block.fromBuffer(genesisbuf);
      block.id.should.equal(block.hash);
    });

  });

  describe('#inspect', function() {

    it('should return the correct inspect of the genesis block', function() {
      var block = Block.fromBuffer(genesisbuf);
      block.inspect().should.equal('<Block ' + genesisidhex + '>');
    });

  });

  describe('#merkleRoot', function() {

    it('should describe as valid merkle root', function() {
      var x = Block.fromRawBlock(dataRawBlockBinary);
      var valid = x.validMerkleRoot();
      valid.should.equal(true);
    });

    it('should describe as invalid merkle root', function() {
      var x = Block.fromRawBlock(dataRawBlockBinary);
      x.transactions.push(new Transaction());
      var valid = x.validMerkleRoot();
      valid.should.equal(false);
    });

    it('should get a null hash merkle root', function() {
      var x = Block.fromRawBlock(dataRawBlockBinary);
      x.transactions = []; // empty the txs
      var mr = x.getMerkleRoot();
      mr.should.deep.equal(Block.Values.NULL_HASH);
    });

  });

});
