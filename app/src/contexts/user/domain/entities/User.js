class User {
    constructor(id, balance, version) {
        this.id = id;
        this.balance = balance;
        this.version = version;
    }

    updateBalance(amount) {
        if (this.balance + amount < 0) {
            throw new Error('Insufficient funds');
        }
        this.balance += amount;
    }

    getBalance() {
        return this.balance;
    }

    getVersion() {
        return this.version;
    }
}

export default User;