"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequestAgainstRules = void 0;
const xrpl_1 = require("@transia/xrpl");
const dist_1 = require("@transia/ripple-keypairs/dist");
function validateXrplAuth(data, auth) {
    console.log('VALIDATE XRPL REQUEST');
    if ((0, dist_1.verify)(data, auth.signature, auth.pk) &&
        (0, xrpl_1.deriveAddress)(auth.pk) === auth.uid) {
        return;
    }
    throw Error('Invalid Request Signature');
}
function validateAuth(str, pathId, req) {
    console.log('AUTH RULE TRIGGERED');
    const auth = req.auth;
    const arr = str.split(' ');
    if (arr[0] === 'request.auth.uid' && arr[1] === '!=' && arr[2] === 'null') {
        if (auth.uid === null) {
            throw Error('Invalid Permissions: Auth must not be null');
        }
    }
    if (arr[0] === 'request.auth.uid' && arr[1] === '==' && arr[2] === 'null') {
        if (auth.uid !== null) {
            throw Error('Invalid Permissions: Auth must be null');
        }
    }
    if (arr[4] === 'request.auth.uid' && arr[5] === '!=' && arr[6] === 'userId') {
        if (auth.uid === pathId) {
            throw Error('Invalid Permissionsr: Invalid Id');
        }
    }
    if (arr[4] === 'request.auth.uid' && arr[5] === '==' && arr[6] === 'userId') {
        if (auth.uid !== pathId) {
            throw Error('Invalid Permissions: Invalid Id');
        }
    }
    if (arr[8] === 'request.auth.type' && arr[9] === '==' && arr[10] === 'xrpl') {
        if (!auth.signature || !auth.pk) {
            throw Error('Invalid Request Parameters');
        }
        validateXrplAuth(req.binary, auth);
    }
    console.log('AUTH VALIDATED');
    return;
}
function validateRequestAgainstRules(req, rules) {
    const pathParams = Object.keys(rules['/databases/{database}/documents']);
    for (let i = 0; i < pathParams.length; i++) {
        const pathParam = pathParams[i];
        console.log(`CHECKING RULE PATH: ${pathParam}`);
        console.log(`CHECKING REQ PATH: ${req.path}`);
        const ruleParamRegex = pathParam.replace(/\{.*\}/, '([A-Za-z0-9]{1,64})');
        const result = req.path.match(ruleParamRegex);
        if (result) {
            console.log(`MATCH: ${result}`);
            const pathId = result[1];
            const rule = rules['/databases/{database}/documents'][pathParam];
            if (rule.read !== null && req.method === 'GET') {
                console.log('READ VALIDATION');
                if (typeof rule.read === 'string') {
                    if (rule.read.includes('request.auth.uid')) {
                        validateAuth(rule.read, pathId, req);
                    }
                }
                if (rule.read === false) {
                    throw Error('Invalid Permissions');
                }
            }
            else if (rule.write !== null &&
                (req.method === 'POST' ||
                    req.method === 'PUT' ||
                    req.method === 'DELETE')) {
                console.log('WRITE VALIDATION');
                if (typeof rule.write === 'string') {
                    if (rule.write.includes('request.auth.uid')) {
                        validateAuth(rule.write, pathId, req);
                    }
                }
                if (rule.write === false) {
                    throw Error('Invalid Permissions');
                }
            }
        }
        if (pathParam === '/{document=**}') {
            console.log('ROOT DB');
            const rule = rules['/databases/{database}/documents'][pathParam];
            if (rule.read && req.method === 'GET') {
                return;
            }
            else if (rule.write &&
                (req.method === 'POST' ||
                    req.method === 'PUT' ||
                    req.method === 'DELETE')) {
                return;
            }
            else {
                throw Error('Invalid Permissions');
            }
        }
    }
    throw Error('Invalid Permissions');
}
exports.validateRequestAgainstRules = validateRequestAgainstRules;
//# sourceMappingURL=index.js.map