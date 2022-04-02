// 這是一個工具小程式，主要是產生 secp256k1 的加密公私鑰
// 比特幣就是用種演算法
'use strict';
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const key = ec.genKeyPair();
const publicKey = key.getPublic('hex');
const privateKey = key.getPrivate('hex');

console.log('\n', 'PublicKey: ', publicKey);
console.log('\n', 'PrivateKey: ', privateKey);

// 試跑兩次程式，取得兩組公私鑰。主要代表自己的錢包(myWallet)以及朋友的錢包(friendWallet)
// 以便後續程式模擬互相交易

// myWallet
/*
PublicKey:  0442f5bbb29c7dab2273d9e898a40994884a2ced0d0ad9cb775d1d5a1b9c7e565ecabb8d575769f69a096f73be705825a6ff30a8f99696b24a546bc2bda25986af
PrivateKey:  1451d2073f532930877015195cc648c92c17ffe84cdf61202dbc075ea0d35a24
*/

// friendWallet
/*
PublicKey:  04e1b0b3e5b56172bd9d1609e8622c631d98f58443c692a0d66383ea0a681864e122befa8d8e57a99badc284e7245482e6168edf4edb93dba1b91d8307c6d0890b
PrivateKey:  d7f43cd3d01e617944f2b0f93f74642ccebd970a918f97f284b0ec15d9210d5d
*/
