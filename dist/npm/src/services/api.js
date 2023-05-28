"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ApiService_dbService;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiService = exports.prepareRequest = void 0;
const xrpl_1 = require("@transia/xrpl");
const db_1 = require("./db");
const dist_1 = require("@transia/ripple-keypairs/dist");
function prepareRequest(id, database, method, path, binary, publicKey, privateKey) {
    return {
        id: id,
        database: database,
        method: method,
        path: path,
        binary: binary,
        auth: {
            type: 'xrpl',
            uid: (0, xrpl_1.deriveAddress)(publicKey),
            signature: (0, dist_1.sign)(binary, privateKey),
            pk: publicKey,
        },
    };
}
exports.prepareRequest = prepareRequest;
class ApiService {
    constructor() {
        _ApiService_dbService.set(this, null);
        this.sendOutput = async (user, response) => {
            await user.send(response);
        };
        console.log('CONSTRUCTOR');
    }
    async handleRequest(user, request, isReadOnly) {
        console.log('HANDLE REQUEST');
        let result;
        __classPrivateFieldSet(this, _ApiService_dbService, new db_1.DbService(request), "f");
        const id = request.path.split('/').pop();
        if (request.method == 'POST') {
            result = await __classPrivateFieldGet(this, _ApiService_dbService, "f").create_binary(id, request.binary);
        }
        if (request.method == 'PUT') {
            result = await __classPrivateFieldGet(this, _ApiService_dbService, "f").update_binary(id, request.binary);
        }
        if (request.method == 'DELETE') {
            result = await __classPrivateFieldGet(this, _ApiService_dbService, "f").delete(id);
        }
        if (request.method == 'GET') {
            result = await __classPrivateFieldGet(this, _ApiService_dbService, "f").get(id);
        }
        if (isReadOnly) {
            await this.sendOutput(user, result);
        }
        else {
            await this.sendOutput(user, { id: request.id, ...result });
        }
    }
}
exports.ApiService = ApiService;
_ApiService_dbService = new WeakMap();
//# sourceMappingURL=api.js.map