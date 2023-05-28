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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _DbService_request, _DbService_dbPath, _DbService_db;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbService = void 0;
const rules_1 = require("../rules");
const lmdbHandler_1 = require("../libs/lmdbHandler");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function readFile(filename) {
    const jsonString = fs_1.default.readFileSync(path_1.default.resolve(__dirname, `${filename}`));
    return jsonString.toString();
}
class DbService {
    constructor(request) {
        _DbService_request.set(this, null);
        _DbService_dbPath.set(this, '');
        _DbService_db.set(this, null);
        const path = request.path.split('/')[1];
        __classPrivateFieldSet(this, _DbService_request, request, "f");
        __classPrivateFieldSet(this, _DbService_dbPath, path, "f");
        __classPrivateFieldSet(this, _DbService_db, new lmdbHandler_1.LMDBDatabase(__classPrivateFieldGet(this, _DbService_dbPath, "f")), "f");
    }
    async create(id, data) {
        console.log('CREATE DATA');
        const resObj = {};
        try {
            __classPrivateFieldGet(this, _DbService_db, "f").open();
            const rules = JSON.parse(readFile('rules.json'));
            (0, rules_1.validateRequestAgainstRules)(__classPrivateFieldGet(this, _DbService_request, "f"), rules);
            await __classPrivateFieldGet(this, _DbService_db, "f").create(id, JSON.stringify({ ...data }));
            resObj.snapshot = { id: id };
        }
        catch (error) {
            console.log('ERROR');
            resObj.error = `Error in creating the ${__classPrivateFieldGet(this, _DbService_dbPath, "f")} ${error}`;
        }
        finally {
            __classPrivateFieldGet(this, _DbService_db, "f").close();
        }
        return resObj;
    }
    async create_binary(id, binary) {
        console.log('CREATE BINARY');
        const resObj = {};
        try {
            __classPrivateFieldGet(this, _DbService_db, "f").open();
            const rules = JSON.parse(readFile('rules.json'));
            (0, rules_1.validateRequestAgainstRules)(__classPrivateFieldGet(this, _DbService_request, "f"), rules);
            await __classPrivateFieldGet(this, _DbService_db, "f").create(id, binary);
            resObj.snapshot = { id: id };
        }
        catch (error) {
            resObj.error = error.message;
        }
        finally {
            __classPrivateFieldGet(this, _DbService_db, "f").close();
        }
        return resObj;
    }
    async get(id) {
        console.log('GET');
        const resObj = {};
        try {
            __classPrivateFieldGet(this, _DbService_db, "f").open();
            const rules = JSON.parse(readFile('rules.json'));
            (0, rules_1.validateRequestAgainstRules)(__classPrivateFieldGet(this, _DbService_request, "f"), rules);
            const result = await __classPrivateFieldGet(this, _DbService_db, "f").get(id);
            resObj.snapshot = { binary: result };
        }
        catch (error) {
            resObj.error = error.message;
        }
        finally {
            __classPrivateFieldGet(this, _DbService_db, "f").close();
        }
        return resObj;
    }
    async update(id, data) {
        console.log('UPDATE');
        const resObj = {};
        try {
            __classPrivateFieldGet(this, _DbService_db, "f").open();
            const rules = JSON.parse(readFile('rules.json'));
            (0, rules_1.validateRequestAgainstRules)(__classPrivateFieldGet(this, _DbService_request, "f"), rules);
            const result = await __classPrivateFieldGet(this, _DbService_db, "f").update(id, JSON.stringify({ ...data }));
            resObj.snapshot = { data: result };
        }
        catch (error) {
            resObj.error = error.message;
        }
        finally {
            __classPrivateFieldGet(this, _DbService_db, "f").close();
        }
        return resObj;
    }
    async update_binary(id, binary) {
        console.log('UPDATE');
        const resObj = {};
        try {
            __classPrivateFieldGet(this, _DbService_db, "f").open();
            const rules = JSON.parse(readFile('rules.json'));
            (0, rules_1.validateRequestAgainstRules)(__classPrivateFieldGet(this, _DbService_request, "f"), rules);
            const result = await __classPrivateFieldGet(this, _DbService_db, "f").update(id, binary);
            resObj.snapshot = { data: result };
        }
        catch (error) {
            resObj.error = error.message;
        }
        finally {
            __classPrivateFieldGet(this, _DbService_db, "f").close();
        }
        return resObj;
    }
    async delete(id) {
        console.log('DELETE');
        const resObj = {};
        try {
            __classPrivateFieldGet(this, _DbService_db, "f").open();
            const rules = JSON.parse(readFile('rules.json'));
            (0, rules_1.validateRequestAgainstRules)(__classPrivateFieldGet(this, _DbService_request, "f"), rules);
            const result = await __classPrivateFieldGet(this, _DbService_db, "f").delete(id);
            console.log(result);
            resObj.snapshot = { data: null };
        }
        catch (error) {
            resObj.error = `Error in deleting the ${__classPrivateFieldGet(this, _DbService_dbPath, "f")} ${error}`;
        }
        finally {
            __classPrivateFieldGet(this, _DbService_db, "f").close();
        }
        return resObj;
    }
}
exports.DbService = DbService;
_DbService_request = new WeakMap(), _DbService_dbPath = new WeakMap(), _DbService_db = new WeakMap();
//# sourceMappingURL=db.js.map