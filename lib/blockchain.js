'use strict';
const { Block } = require('./block.js');
const { Transaction } = require('./transaction.js');
const secureRandomNumber = require('random-number-csprng'); // 安全的亂數，非同步
const pjson = require('prettyjson');

class BlockChain {
    constructor(initDifficulty = 2) {
        this.chain = [this.createGenesisBlock()]; // 建立最初的 Block
        this.difficulty = initDifficulty; // 成塊難度
        this.pendingTransactions = []; // 交易項目
        this.miningBlockReward = 100; // 挖到礦後，取得打包權，系統給 100 個幣回饋
        this.miningFeeReward = 0; // Block 打包，會依照打包的交易內容回饋 gas fee 獎勵
    }

    // 建立最初的 Block
    createGenesisBlock() {
        return new Block(
            Date.parse('2022-01-01T01:01:01'),
            [{ fromAddress: 'The Genesis Block' }],
            '0'
        );
    }

    // 取得最後一個 Block
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    // 挖礦，打包 Block，挖到後將 Block 接上區塊鍊
    async minePendingTransactions(miningRewardAddress) {
        // 交易費回饋，因為實際上比特幣的交易費是變動的，所以這裏採用隨機產生 1-10 其中一個數值
        this.miningFeeReward = await secureRandomNumber(1, 10);

        // 以比特幣來說，如果挖到礦之後，得到的獎勵有兩個，一個是系統給的獎勵，基本上大約每四年減一半(這裏給定值100)
        // 另一個是打包交易的 Gas fee回饋，兩個加總為成功打包的全部獎勵。
        const miningReward = this.miningBlockReward + this.miningFeeReward;

        // 把獎勵的幣轉給礦工帳號，加入一筆交易
        const rewardTx = new Transaction(
            'COINBASE (Newly generated coins)',
            miningRewardAddress,
            miningReward
        );
        this.pendingTransactions.push(rewardTx);

        // 建立區塊打包
        const block = new Block(
            Date.now(),
            this.pendingTransactions,
            this.getLatestBlock().hash
        );

        // 挖礦，取得打包接上鍊的權力
        block.mineBlock(this.difficulty);

        // 接上區塊鍊
        console.log('Block successfully mined !\n');
        this.chain.push(block);

        // 交易清空
        this.pendingTransactions = [];
    }

    // 加入一筆交易
    addTransaction(transaction) {
        // 交易不能沒有來源錢包地址以及目的錢包地址
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error(
                'The transaction must include from and to address.'
            );
        }

        // 交易金額不能小於等於 0
        if (transaction.amount <= 0) {
            throw new Error('The transaction amount should be higher than 0.');
        }

        // 錢包裏的錢要大於轉出的金額
        const walletBalance = this.getBalanceOfAddress(transaction.fromAddress);
        if (walletBalance < transaction.amount) {
            throw new Error('Balance of this wallet is NOT enough.');
        }

        // 這筆交易必須是有效的 (經過簽名驗證等)
        if (!transaction.isValid()) {
            throw new Error('Can not add a invalid transaction to this chain.');
        }

        // 把這筆交易加入 pending ，等待後續打包
        this.pendingTransactions.push(transaction);
    }

    // 算出錢包的餘額
    getBalanceOfAddress(address) {
        let balance = 10000; // 預設每個錢包都有 10000 coins
        for (const block of this.chain) {
            for (const trans of block.transactions) {
                // 待算餘額的錢包位址如果是 from，代表匯出，所以餘額要扣除
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }

                // 待算餘額的錢包位址如果是 to，代表匯入，所以餘額要加進去
                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }
        return balance;
    }

    // 設定挖礦難度
    setDifficulty(dif) {
        this.difficulty = dif;
    }

    // 驗證整個區塊鍊的有效性
    isChainValid() {
        // 驗證創始 Block 是否正確
        const genesisBlock = JSON.stringify(this.createGenesisBlock());
        if (genesisBlock !== JSON.stringify(this.chain[0])) {
            return false;
        }

        // 驗證後面的每一個 Block
        for (let i = 1; i < this.chain.length; i++) {
            let currentBlock = this.chain[i];
            let previousBlock = this.chain[i - 1];

            // 驗證 Block 內所有交易項目的正確性
            if (!currentBlock.hasValidTransactions()) return false;

            // 驗證每一個 Block 的 hash，確實資料沒有被篡改
            if (currentBlock.hash !== currentBlock.calculateHash())
                return false;

            // 驗證每一個 Block 裏的 previousHash 是不是跟上一個 Block 的 hash 一樣
            if (currentBlock.previousHash !== previousBlock.hash) return false;
        }
        return true;
    }

    // 顯示完成區塊鍊的內容
    showTheChain() {
        console.log(JSON.stringify(this.chain, null, 4));
    }

    showTheChain2() {
        console.log(pjson.render(this.chain));
    }
}

module.exports.BlockChain = BlockChain;
