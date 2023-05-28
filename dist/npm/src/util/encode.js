"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xrpAddressToHex = exports.varStringToHex = exports.lengthToHex = exports.uint224ToHex = exports.uint64ToHex = exports.uint32ToHex = exports.uint8ToHex = exports.encodeModel = void 0;
function encodeModel(model) {
    const metadata = model.getMetadata();
    let result = '';
    for (const { field, type, maxStringLength, maxArrayLength } of metadata) {
        const fieldValue = model[field];
        if (fieldValue === undefined) {
            throw Error(`Field ${field} is undefined in model`);
        }
        let encodedField = '';
        if (type === 'model') {
            encodedField = encodeModel(fieldValue);
        }
        else if (type == 'varModelArray') {
            if (maxArrayLength === undefined) {
                throw Error('maxArrayLength is required for type varModelArray');
            }
            if (fieldValue.length > 0 && fieldValue.length > maxArrayLength) {
                throw Error(`${field} varModelArray length ${fieldValue.length} exceeds maxArrayLength ${maxArrayLength} for model ${fieldValue[0].constructor.name}`);
            }
            const modelArray = fieldValue;
            const lengthHex = lengthToHex(modelArray.length, 2 ** 8);
            encodedField = lengthHex;
            for (const model of modelArray) {
                encodedField += encodeModel(model);
            }
        }
        else {
            encodedField = encodeField(fieldValue, type, maxStringLength);
        }
        result += encodedField;
    }
    return result;
}
exports.encodeModel = encodeModel;
function encodeField(fieldValue, type, maxStringLength) {
    switch (type) {
        case 'bool':
            return uint8ToHex(fieldValue);
        case 'uint8':
            return uint8ToHex(fieldValue);
        case 'uint32':
            return uint32ToHex(fieldValue);
        case 'uint64':
            return uint64ToHex(fieldValue);
        case 'uint224':
            return uint224ToHex(fieldValue);
        case 'varString':
            if (maxStringLength === undefined) {
                throw Error('maxStringLength is required for type varString');
            }
            return varStringToHex(fieldValue, maxStringLength);
        case 'xrpAddress':
            return xrpAddressToHex(fieldValue);
        case 'model':
            throw Error('model type should be handled in encodeModel');
        case 'varModelArray':
            throw Error('varModelArray type should be handled in encodeModel');
        default:
            throw Error(`Unknown type: ${type}`);
    }
}
function uint8ToHex(value) {
    if (value < 0 || value > 255) {
        throw Error(`Integer ${value} is out of range for uint8 (0-255)`);
    }
    return value.toString(16).padStart(2, '0').toUpperCase();
}
exports.uint8ToHex = uint8ToHex;
function uint32ToHex(value) {
    if (value < 0 || value > 2 ** 32 - 1) {
        throw Error(`Integer ${value} is out of range for uint32 (0-4294967295)`);
    }
    return value.toString(16).padStart(8, '0').toUpperCase();
}
exports.uint32ToHex = uint32ToHex;
function uint64ToHex(value) {
    if (value < 0 || value > BigInt(18446744073709551615n)) {
        throw Error(`Integer ${value} is out of range for uint64 (0-18446744073709551615)`);
    }
    return value.toString(16).padStart(16, '0').toUpperCase();
}
exports.uint64ToHex = uint64ToHex;
function uint224ToHex(value) {
    if (value < 0 ||
        value >
            BigInt(26959946667150639794667015087019630673637144422540572481103610249215n)) {
        throw Error(`Integer ${value} is out of range for uint224 (0-26959946667150639794667015087019630673637144422540572481103610249215)`);
    }
    return value.toString(16).padStart(56, '0').toUpperCase();
}
exports.uint224ToHex = uint224ToHex;
function lengthToHex(value, maxStringLength) {
    if (maxStringLength <= 2 ** 8) {
        return value.toString(16).padStart(2, '0');
    }
    else if (maxStringLength <= 2 ** 16) {
        return value.toString(16).padStart(4, '0');
    }
    throw Error('maxStringLength exceeds 2 bytes');
}
exports.lengthToHex = lengthToHex;
function varStringToHex(value, maxStringLength) {
    if (value.length > maxStringLength) {
        throw Error(`String length ${value.length} exceeds max length of ${maxStringLength}`);
    }
    const prefixLength = lengthToHex(value.length, maxStringLength);
    const content = Buffer.from(value, 'utf8').toString('hex');
    const paddedContent = content.padEnd(maxStringLength * 2, '0');
    return (prefixLength + paddedContent).toUpperCase();
}
exports.varStringToHex = varStringToHex;
function xrpAddressToHex(value) {
    if (value.length > 35) {
        throw Error(`XRP address length ${value.length} exceeds 35 characters`);
    }
    if (value.length < 25) {
        throw Error(`XRP address length ${value.length} is less than 25 characters`);
    }
    const length = uint8ToHex(value.length);
    const content = Buffer.from(value, 'utf8').toString('hex');
    return (length + content.padEnd(70, '0')).toUpperCase();
}
exports.xrpAddressToHex = xrpAddressToHex;
//# sourceMappingURL=encode.js.map