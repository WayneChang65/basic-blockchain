'use strict';
const { SHA256 } = require('crypto-js');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1'); // 比特幣錢包用的就是 secp256k1 加密演算法

class Transaction {
    // 一筆交易，包含從哪個錢包(Address)到哪個錢包，以及金額多少
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    // 計算 hash ，其內容包含交易的 from 與 to 的 Address 還有金額
    calculateHash() {
        return SHA256(
            this.fromAddress + this.toAddress + this.amount
        ).toString();
    }

    // 為了確保交易是從自己的錢包出去，而不是被偽造，所以必須進行簽名驗證
    signTransaction(signingKey) {
        // 檢查要簽名驗證的錢包跟來源位址要一樣
        if (signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('You can not sign transaction for other wallets!');
        }

        // 計算 hash
        const hashTransaction = this.calculateHash();

        // 把這筆交易的 hash 簽名
        const sign = signingKey.sign(hashTransaction, 'base64');

        // 取得簽名後的 hex 表示
        this.signature = sign.toDER('hex');
    }

    // 驗證本交易是否有效
    isValid() {
        // 如果是因為挖礦所得，來源是'COINBASE (Newly generated coins)'，就 OK
        if (this.fromAddress === 'COINBASE (Newly generated coins)')
            return true;

        // 不能沒有簽名
        if (!this.signature || this.signature === 0) {
            throw new Error('No signature in this transaction!');
        }

        // 比特幣的錢包地址其實就是公鑰
        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');

        // 用公鑰來驗證簽名，看看結果是不是當初加密的 hash，如果相同，代表正確。
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

module.exports.Transaction = Transaction;
