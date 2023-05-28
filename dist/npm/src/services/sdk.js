"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sdk = exports.DocumentReference = exports.CollectionReference = exports.KeyPair = void 0;
const xrpl_1 = require("@transia/xrpl");
const api_1 = require("./api");
class KeyPair {
    constructor(publicKey, privateKey) {
        this.publicKey = null;
        this.privateKey = null;
        this.publicKey = publicKey;
        this.privateKey = privateKey;
    }
}
exports.KeyPair = KeyPair;
class CollectionReference {
    constructor(path, doc, sdk) {
        this.path = null;
        this.doc = null;
        this.sdk = null;
        this.path = path;
        this.doc = doc;
        this.sdk = sdk;
    }
    document(path) {
        this.doc = new DocumentReference(path, this);
        return this.doc;
    }
}
exports.CollectionReference = CollectionReference;
class DocumentReference {
    constructor(path, col) {
        this.path = null;
        this.col = null;
        this.path = path;
        this.col = col;
    }
    async get() {
        const path = `${this.col.path}/${this.col.doc.path}`;
        console.log(`GET: ${path}`);
        console.log((0, xrpl_1.convertStringToHex)(path));
        const request = (0, api_1.prepareRequest)('1', this.col.sdk.database, 'GET', path, (0, xrpl_1.convertStringToHex)(path), this.col.sdk.keypair.publicKey, this.col.sdk.keypair.privateKey);
        await this.col.sdk.read(request);
    }
    async set(binary) {
        const path = `${this.col.path}/${this.col.doc.path}`;
        console.log(`SET: ${path}`);
        console.log(binary);
        const request = (0, api_1.prepareRequest)('1', this.col.sdk.database, 'POST', path, binary, this.col.sdk.keypair.publicKey, this.col.sdk.keypair.privateKey);
        await this.col.sdk.submit(request);
    }
    async update(binary) {
        const path = `${this.col.path}/${this.col.doc.path}`;
        console.log(`UPDATE: ${path}`);
        console.log(binary);
        const request = (0, api_1.prepareRequest)('1', this.col.sdk.database, 'PUT', path, binary, this.col.sdk.keypair.publicKey, this.col.sdk.keypair.privateKey);
        await this.col.sdk.submit(request);
    }
    async delete() {
        const path = `${this.col.path}/${this.col.doc.path}`;
        console.log(`DELETE: ${path}`);
        console.log((0, xrpl_1.convertStringToHex)(path));
        const request = (0, api_1.prepareRequest)('1', this.col.sdk.database, 'DELETE', path, (0, xrpl_1.convertStringToHex)(path), this.col.sdk.keypair.publicKey, this.col.sdk.keypair.privateKey);
        await this.col.sdk.submit(request);
    }
    collection(path) {
        this.col = new CollectionReference(path, this);
    }
}
exports.DocumentReference = DocumentReference;
class Sdk {
    constructor(database, keypair, client) {
        this.client = null;
        this.keypair = null;
        this.database = null;
        this.promiseMap = new Map();
        this.database = database;
        this.keypair = keypair;
        this.client = client;
    }
    collection(path) {
        return new CollectionReference(path, null, this);
    }
    async submit(request) {
        let resolver, rejecter;
        try {
            const inpString = JSON.stringify(request);
            this.client.submitContractInput(inpString).then((input) => {
                input.submissionStatus.then((s) => {
                    if (s.status !== 'accepted') {
                        console.log(`Ledger_Rejection: ${s.reason}`);
                        throw `Ledger_Rejection: ${s.reason}`;
                    }
                });
            });
            return new Promise((resolve, reject) => {
                resolver = resolve;
                rejecter = reject;
                this.promiseMap.set(request.id, {
                    resolver: resolver,
                    rejecter: rejecter,
                });
            });
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async read(request) {
        try {
            const inpString = JSON.stringify(request);
            return this.client.submitContractReadRequest(inpString);
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
}
exports.Sdk = Sdk;
//# sourceMappingURL=sdk.js.map