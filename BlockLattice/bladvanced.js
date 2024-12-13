// Base Block Class
class Block {
    constructor(previousBlockId, balance, timestamp = Date.now()) {
        this.blockId = Block.generateId();
        this.previousBlockId = previousBlockId;
        this.balance = balance; // Balance after this block
        this.timestamp = timestamp;
        this.signature = Block.generateSignature(); // Placeholder for digital signature
    }

    static generateId() {
        // Simple unique ID generator using current timestamp and random number
        return `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    }

    static generateSignature() {
        // Placeholder for digital signature
        return `signature-${Math.floor(Math.random() * 1000000)}`;
    }
}

// SendBlock Class
class SendBlock extends Block {
    constructor(previousBlockId, balance, amount, recipient) {
        super(previousBlockId, balance);
        this.amount = amount;
        this.recipient = recipient; // Recipient's account ID
        this.type = 'Send';
    }
}

// ReceiveBlock Class
class ReceiveBlock extends Block {
    constructor(previousBlockId, balance, sender, amount) {
        super(previousBlockId, balance);
        this.sender = sender; // Sender's account ID
        this.amount = amount;
        this.type = 'Receive';
    }
}

class Account {
    constructor(accountId, initialBalance = 0) {
        this.accountId = accountId;
        this.blocks = []; // List of blocks in the account's chain
        this.balance = initialBalance;
        this.representative = null; // Placeholder for representative (not implemented)
        this.openTimestamp = null;
        this.lastModified = null;
    }

    // Retrieve the last block in the account's chain
    getLastBlock() {
        if (this.blocks.length === 0) return null;
        return this.blocks[this.blocks.length - 1];
    }

    // Open the account by creating an initial ReceiveBlock (OpenBlock)
    openAccount() {
        if (this.blocks.length === 0) {
            const openBlock = new ReceiveBlock(null, this.balance, 'Genesis', this.balance);
            this.blocks.push(openBlock);
            this.openTimestamp = openBlock.timestamp;
            this.lastModified = openBlock.timestamp;
            console.log(`Account "${this.accountId}" opened with balance ${this.balance}`);
        } else {
            console.log(`Account "${this.accountId}" is already opened.`);
        }
    }

    // Create a SendBlock to send funds to another account
    createSendBlock(amount, recipientId) {
        if (amount > this.balance) {
            console.log(`Insufficient balance in account "${this.accountId}".`);
            return null;
        }

        const previousBlock = this.getLastBlock();
        const newBalance = this.balance - amount;
        const sendBlock = new SendBlock(
            previousBlock ? previousBlock.blockId : null,
            newBalance,
            amount,
            recipientId
        );

        this.blocks.push(sendBlock);
        this.balance = newBalance;
        this.lastModified = sendBlock.timestamp;
        console.log(`Account "${this.accountId}" sent ${amount} to "${recipientId}". New balance: ${this.balance}`);
        return sendBlock;
    }

    // Create a ReceiveBlock to receive funds from another account
    createReceiveBlock(senderId, amount) {
        const previousBlock = this.getLastBlock();
        const newBalance = this.balance + amount;
        const receiveBlock = new ReceiveBlock(
            previousBlock ? previousBlock.blockId : null,
            newBalance,
            senderId,
            amount
        );

        this.blocks.push(receiveBlock);
        this.balance = newBalance;
        this.lastModified = receiveBlock.timestamp;
        console.log(`Account "${this.accountId}" received ${amount} from "${senderId}". New balance: ${this.balance}`);
        return receiveBlock;
    }

    // Display the account's blockchain
    displayBlockchain() {
        console.log(`\nBlockchain of "${this.accountId}":`);
        this.blocks.forEach((block, index) => {
            if (block.type === 'Send') {
                console.log(`  ${index + 1}. SendBlock [ID: ${block.blockId}] -> To: ${block.recipient}, Amount: ${block.amount}, Balance: ${block.balance}, Signature: ${block.signature}`);
            } else if (block.type === 'Receive') {
                console.log(`  ${index + 1}. ReceiveBlock [ID: ${block.blockId}] <- From: ${block.sender}, Amount: ${block.amount}, Balance: ${block.balance}, Signature: ${block.signature}`);
            }
        });
    }

    // Get detailed account info
    getAccountInfo() {
        const lastBlock = this.getLastBlock();
        return {
            accountId: this.accountId,
            openTimestamp: this.openTimestamp ? new Date(this.openTimestamp).toLocaleString() : 'N/A',
            lastModified: this.lastModified ? new Date(this.lastModified).toLocaleString() : 'N/A',
            balance: this.balance,
            version: '2', // Placeholder
            height: this.blocks.length,
            lastSend: this.blocks.filter(block => block.type === 'Send').slice(-1)[0]?.timestamp
                ? new Date(this.blocks.filter(block => block.type === 'Send').slice(-1)[0].timestamp).toLocaleString()
                : '-',
            lastRepresentativeChange: '-', // Placeholder
        };
    }
}

class Network {
    constructor() {
        this.accounts = {}; // Mapping of accountId to Account instances
        this.loadFromLocalStorage(); // Load state on initialization
    }

    // Register a new account on the network
    registerAccount(account) {
        if (this.accounts[account.accountId]) {
            console.log(`Account "${account.accountId}" is already registered.`);
            return;
        }
        this.accounts[account.accountId] = account;
        account.openAccount();
        this.saveToLocalStorage();
    }

    // Broadcast a SendBlock to the network, triggering the recipient to create a ReceiveBlock
    broadcastSendBlock(sendBlock) {
        const recipientAccount = this.accounts[sendBlock.recipient];
        if (!recipientAccount) {
            console.log(`Recipient account "${sendBlock.recipient}" not found in the network.`);
            return;
        }

        // Simulate network delay (optional)
        setTimeout(() => {
            recipientAccount.createReceiveBlock(sendBlock.senderId || 'Unknown Sender', sendBlock.amount);
            console.log(`Broadcasted SendBlock "${sendBlock.blockId}" to "${sendBlock.recipient}".`);
            this.saveToLocalStorage();
        }, 100); // 100ms delay
    }

    // Display the blockchains of all accounts
    displayAllBlockchains() {
        Object.values(this.accounts).forEach(account => account.displayBlockchain());
    }

    // Display detailed info of all accounts
    displayAllAccountInfo() {
        Object.values(this.accounts).forEach(account => {
            const info = account.getAccountInfo();
            console.log(`\nAccount ID: ${info.accountId}`);
            console.log(`Funding Account: ${info.accountId}`);
            console.log(`Funding Timestamp: ${info.openTimestamp}`);
            console.log(`Open Timestamp: ${info.openTimestamp}`);
            console.log(`Opening Balance: ${info.blocks[0]?.amount || info.balance}`);
            console.log(`Maximum Balance: ${info.balance}`); // Simplified
            console.log(`Minimum Balance: ${info.blocks[0]?.amount || info.balance}`); // Simplified
            console.log(`Receivable Balance: -`); // Placeholder
            console.log(`Version: ${info.version}`);
            console.log(`Height: ${info.height}`);
            console.log(`Last Modified: ${info.lastModified}`);
            console.log(`Last Modified (non-epoch): ${info.lastModified}`);
            console.log(`Last Send: ${info.lastSend ? new Date(info.lastSend).toLocaleString() : '-'}`);
            console.log(`Last Representative Change: ${info.lastRepresentativeChange}`);
        });
    }

    // Save network state to localStorage
    saveToLocalStorage() {
        const networkState = {
            accounts: {}
        };

        Object.values(this.accounts).forEach(account => {
            networkState.accounts[account.accountId] = {
                accountId: account.accountId,
                balance: account.balance,
                blocks: account.blocks,
                openTimestamp: account.openTimestamp,
                lastModified: account.lastModified
            };
        });

        localStorage.setItem('nanoNetwork', JSON.stringify(networkState));
    }

    // Load network state from localStorage
    loadFromLocalStorage() {
        const networkState = JSON.parse(localStorage.getItem('nanoNetwork'));
        if (networkState && networkState.accounts) {
            Object.values(networkState.accounts).forEach(accountData => {
                const account = new Account(accountData.accountId, accountData.balance);
                account.blocks = accountData.blocks.map(blockData => {
                    if (blockData.type === 'Send') {
                        return Object.assign(new SendBlock(), blockData);
                    } else if (blockData.type === 'Receive') {
                        return Object.assign(new ReceiveBlock(), blockData);
                    }
                    return Object.assign(new Block(), blockData);
                });
                account.openTimestamp = accountData.openTimestamp;
                account.lastModified = accountData.lastModified;
                this.accounts[account.accountId] = account;
            });
            console.log('Network state loaded from localStorage.');
        } else {
            console.log('No existing network state found. Starting fresh.');
        }
    }
}