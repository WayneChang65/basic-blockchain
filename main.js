'use strict';
const fmlog = require('@waynechang65/fml-consolelog').log;

const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const { BlockChain } = require('./lib/blockchain.js');
const { Transaction } = require('./lib/transaction.js');

// 設定挖礦困難度為 4
const difficulty = 4;

// secp256k1 產生的私鑰加入，並且可透過私鑰取得公鑰(錢包地址)，模擬我的錢包(myWallet)
const myKey = ec.keyFromPrivate(
    '1451d2073f532930877015195cc648c92c17ffe84cdf61202dbc075ea0d35a24'
);
const myWalletAddr = myKey.getPublic('hex');

// 把另一個secp256k1 產生的公鑰(錢包地址)加入，模擬朋友的錢包(friendWallet)
const friendWalletAddr =
    '04e1b0b3e5b56172bd9d1609e8622c631d98f58443c692a0d66383ea0a681864e122befa8d8e57a99badc284e7245482e6168edf4edb93dba1b91d8307c6d0890b';

(async () => {
    fmlog('sys_msg', ['wCoin Blockchain', '']);

    // 建立一個叫 wCoin 虛擬貨幣的區塊鍊
    let wCoin = new BlockChain(difficulty);

    // 建立第一筆交易
    // 把我的錢包轉出 10 個 coins 給朋友的錢包。簽名這筆交易後，加入此交易項目
    const tx11 = new Transaction(myWalletAddr, friendWalletAddr, 10);
    tx11.signTransaction(myKey);
    wCoin.addTransaction(tx11);

    // 建立第二筆交易
    // 把我的錢包轉出 20 個 coins 給朋友的錢包。簽名這筆交易後，加入此交易項目
    const tx12 = new Transaction(myWalletAddr, friendWalletAddr, 20);
    tx12.signTransaction(myKey);
    wCoin.addTransaction(tx12);

    // 礦工開始挖礦，並成功產生新的區塊
    fmlog('event_msg', ['SYS', 'Starting the miner...', '']);
    await wCoin.minePendingTransactions(myWalletAddr);

    // 建立第三筆交易
    // 把我的錢包轉出 1 個 coins 給朋友的錢包。簽名這筆交易後，加入此交易項目
    const tx21 = new Transaction(myWalletAddr, friendWalletAddr, 1);
    tx21.signTransaction(myKey);
    wCoin.addTransaction(tx21);

    // 建立第四筆交易
    // 把我的錢包轉出 7 個 coins 給朋友的錢包。簽名這筆交易後，加入此交易項目
    const tx22 = new Transaction(myWalletAddr, friendWalletAddr, 7);
    tx22.signTransaction(myKey);
    wCoin.addTransaction(tx22);

    // 礦工開始挖礦，並成功產生新的區塊
    fmlog('event_msg', ['SYS', 'Starting the miner...', '']);
    await wCoin.minePendingTransactions(myWalletAddr);

    // 顯示我的錢包餘額
    console.log(
        'Balance of myWallet: ',
        wCoin.getBalanceOfAddress(myWalletAddr)
    );

    // 顯示朋友錢包餘額
    console.log(
        'Balance of friendWallet: ',
        wCoin.getBalanceOfAddress(friendWalletAddr)
    );

    // 驗證整個區塊鍊的有效性
    console.log('\nIs the chain valid ? ', wCoin.isChainValid(), '\n');

    // 顯示完整的區塊鍊內容
    wCoin.showTheChain2();
})();
