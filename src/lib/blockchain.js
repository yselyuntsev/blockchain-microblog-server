const sha256 = require("sha256");

class Block {
  constructor(index, nonce, prevHash, hash, data) {
    this.index = index;
    this.timestamp = Date.now();
    this.nonce = nonce;
    this.prevHash = prevHash;
    this.hash = hash;
    this.data = data;
  }
}

class Blockchain {
  constructor() {
    this._chain = [];
    this._pending = {};

    this._createBlock(100, "---", "Genesis Block");
  }

  get fullBlockchain() {
    return this._chain;
  }

  get blockchain() {
    return this._chain.slice(1).reverse();
  }

  get _lastBlock() {
    return this._chain.slice(-1)[0];
  }

  replace(chain) {
    this._chain = chain;
  }

  add(data) {
    this._pending = data;
    this._mine();
  }

  validate(blockchain) {
    const genesisBlock = blockchain[0];
    if (
      genesisBlock.nonce !== 100 ||
      genesisBlock.hash !== "Genesis Block" ||
      genesisBlock.prevHash !== "---"
    ) {
      return false;
    }

    for (let i = 1; i < blockchain.length; i++) {
      const block = blockchain[i];
      const prevBlock = blockchain[i - 1];

      const blockData = {
        data: block.data,
        index: block.index,
      };

      const blockHash = this._hashBlock(prevBlock.hash, blockData, block.nonce);

      if (blockHash.substring(0, 2) !== "00") return false;
      if (block.prevHash !== prevBlock.hash) return false;

      return true;
    }
  }

  _createBlock(nonce, prevHash, hash) {
    const block = new Block(
      this._chain.length,
      nonce,
      prevHash,
      hash,
      this._pending
    );

    this._pending = {};
    this._chain.push(block);

    return block;
  }

  _mine() {
    const lastBlock = this._lastBlock;
    const prevHash = lastBlock.hash;

    const currentBlock = {
      data: this._pending,
      index: lastBlock.index + 1,
    };

    const nonce = this._proofOfWork(prevHash, currentBlock);
    const blockHash = this._hashBlock(prevHash, currentBlock, nonce);
    const block = this._createBlock(nonce, prevHash, blockHash);

    return block;
  }

  _proofOfWork(prevHash, currentBlock) {
    let nonce = 0;
    let hash = this._hashBlock(prevHash, currentBlock, nonce);

    while (hash.substring(0, 2) !== "00") {
      nonce++;
      hash = this._hashBlock(prevHash, currentBlock, nonce);
    }

    return nonce;
  }

  _hashBlock(prevHash, currentBlock, nonce) {
    const data = prevHash + JSON.stringify(currentBlock) + nonce;
    const hash = sha256(data);
    return hash;
  }
}

module.exports = Blockchain;
