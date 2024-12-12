// Base Block Class
class Block {
    constructor(previousBlockId, timestamp = Date.now()) {
        this.blockId = Block.generateId();
        this.previousBlockId = previousBlockId;
        this.timestamp = timestamp;
    }

    static generateId() {
        // Simple unique ID generator using current timestamp and random number
        return `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    }
}

// SendBlock Class
class SendBlock extends Block {
    constructor(previousBlockId, amount, recipient) {
        super(previousBlockId);
        this.amount = amount;
        this.recipient = recipient; // Recipient's account ID
        this.type = 'Send';
    }
}

// ReceiveBlock Class
class ReceiveBlock extends Block {
    constructor(previousBlockId, sender, amount) {
        super(previousBlockId);
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
    }

    // Retrieve the last block in the account's chain
    getLastBlock() {
        if (this.blocks.length === 0) return null;
        return this.blocks[this.blocks.length - 1];
    }

    // Open the account by creating an initial ReceiveBlock (OpenBlock)
    openAccount() {
        if (this.blocks.length === 0) {
            const openBlock = new ReceiveBlock(null, 'Genesis', this.balance);
            this.blocks.push(openBlock);
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
        const sendBlock = new SendBlock(
            previousBlock ? previousBlock.blockId : null,
            amount,
            recipientId
        );

        this.blocks.push(sendBlock);
        this.balance -= amount;
        console.log(`Account "${this.accountId}" sent ${amount} to "${recipientId}". New balance: ${this.balance}`);
        return sendBlock;
    }

    // Create a ReceiveBlock to receive funds from another account
    createReceiveBlock(senderId, amount) {
        const previousBlock = this.getLastBlock();
        const receiveBlock = new ReceiveBlock(
            previousBlock ? previousBlock.blockId : null,
            senderId,
            amount
        );

        this.blocks.push(receiveBlock);
        this.balance += amount;
        console.log(`Account "${this.accountId}" received ${amount} from "${senderId}". New balance: ${this.balance}`);
        return receiveBlock;
    }

    // Display the account's blockchain
    displayBlockchain() {
        console.log(`\nBlockchain of "${this.accountId}":`);
        this.blocks.forEach((block, index) => {
            if (block.type === 'Send') {
                console.log(`  ${index + 1}. SendBlock [ID: ${block.blockId}] -> To: ${block.recipient}, Amount: ${block.amount}`);
            } else if (block.type === 'Receive') {
                console.log(`  ${index + 1}. ReceiveBlock [ID: ${block.blockId}] <- From: ${block.sender}, Amount: ${block.amount}`);
            }
        });
    }
}


class Network {
    constructor() {
        this.accounts = {}; // Mapping of accountId to Account instances
    }

    // Register a new account on the network
    registerAccount(account) {
        if (this.accounts[account.accountId]) {
            console.log(`Account "${account.accountId}" is already registered.`);
            return;
        }
        this.accounts[account.accountId] = account;
        account.openAccount();
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
        }, 100); // 100ms delay
    }

    // Display the blockchains of all accounts
    displayAllBlockchains() {
        Object.values(this.accounts).forEach(account => account.displayBlockchain());
    }
}