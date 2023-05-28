"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LMDBDatabase = void 0;
const node_lmdb_1 = require("node-lmdb");
class LMDBDatabase {
    constructor(dbCollection) {
        this.characters =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        this.dbCollection = dbCollection;
        this.openConnections = 0;
    }
    open() {
        if (this.openConnections <= 0) {
            console.log('OPEN');
            this.env = new node_lmdb_1.Env();
            this.env.open({
                path: 'mydata',
                mapSize: 2 * 1024 * 1024 * 1024,
                maxDbs: 3,
            });
            console.log(`OPENING COLLECTION: ${this.dbCollection}`);
            this.db = this.env.openDbi({
                name: this.dbCollection,
                create: true,
            });
            this.openConnections = 1;
        }
        else
            console.log('OPEN - ELSE');
        this.openConnections++;
    }
    close() {
        if (this.openConnections <= 1) {
            console.log('CLOSE');
            if (this.db && this.env) {
                this.db.close();
                this.env.close();
                this.db = null;
                this.env = null;
                this.openConnections = 0;
            }
        }
        else
            console.log('CLOSE - ELSE');
        this.openConnections--;
    }
    create(key, binary) {
        if (!this.env)
            throw 'Env connection is not open.';
        if (!this.db)
            throw 'Database connection is not open.';
        console.log('LMDB CREATE');
        const txn = this.env.beginTxn();
        txn.putBinary(this.db, key, Buffer.from(binary));
        txn.commit();
        return key;
    }
    async get(key) {
        if (!this.env)
            throw 'Env connection is not open.';
        if (!this.db)
            throw 'Database connection is not open.';
        console.log('LMDB GET');
        const txn = this.env.beginTxn();
        const data = txn.getBinary(this.db, key);
        txn.commit();
        if (!data) {
            throw Error('No Data');
        }
        return data.toString();
    }
    async update(key, binary) {
        if (!this.env)
            throw 'Env connection is not open.';
        if (!this.db)
            throw 'Database connection is not open.';
        console.log('LMDB UPDATE');
        const txn = this.env.beginTxn();
        txn.putBinary(this.db, key, Buffer.from(binary));
        txn.commit();
        if (!binary) {
            return {
                error: 'No Data',
                status: 'error',
                type: 'error',
            };
        }
        return true;
    }
    async delete(key) {
        if (!this.env)
            throw 'Env connection is not open.';
        if (!this.db)
            throw 'Database connection is not open.';
        console.log('LMDB DELETE');
        const txn = this.env.beginTxn();
        txn.del(this.db, key);
        txn.commit();
        return true;
    }
    generateKey(length) {
        let result = ' ';
        const charactersLength = this.characters.length;
        for (let i = 0; i < length; i++) {
            result += this.characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}
exports.LMDBDatabase = LMDBDatabase;
//# sourceMappingURL=lmdbHandler.js.map