'use strict';
const SHA256 = require('crypto-js/sha256');

class Block {
    // 建立一個Block instance的constructor
    // 建立時，代入時間戳以及一些交易，還有上一個 block 的 hash
    constructor(timestamp, transactions, previousHash = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    // 計算 hash，使用 SHA256。計算 hash 的內容包含以下
    calculateHash() {
        return SHA256(
            this.timestamp +
                JSON.stringify(this.transactions) +
                this.previousHash +
                this.nonce
        ).toString();
    }

    // 挖礦，依照 difficulty 決定 最終 hash 的前面 n 位數都是 0。
    // 因為決定 hash 的內容都是固定值，所以用一個累加的 nonce 來讓礦工們試出最終符合 n 位數為 0 的 hash
    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== '0'.repeat(difficulty)) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log('Block mined(' + this.nonce + '): ' + this.hash);
    }

    // 驗證所有交易是否有效
    hasValidTransactions() {
        for (const tx of this.transactions) {
            if (!tx.isValid()) return false;
        }
        return true;
    }
}

module.exports.Block = Block;
