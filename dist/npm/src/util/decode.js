"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hexToXRPAddress = exports.hexToVarString = exports.hexToUInt224 = exports.hexToUInt64 = exports.hexToUInt32 = exports.hexToUInt8 = exports.decodeModel = void 0;
const BaseModel_1 = require("../models/BaseModel");
const encode_1 = require("./encode");
function decodeModel(hex, modelClass) {
    const metadata = modelClass.prototype.getMetadata();
    const model = new modelClass();
    let hexIndex = 0;
    let decodedField = null;
    for (const { field, type, maxStringLength, modelClass: fieldModelClass, } of metadata) {
        let fieldHex = '';
        switch (type) {
            case 'bool':
                fieldHex = hex.slice(hexIndex, hexIndex + 2);
                decodedField = decodeField(fieldHex, type);
                hexIndex += 2;
                break;
            case 'uint8':
                fieldHex = hex.slice(hexIndex, hexIndex + 2);
                decodedField = decodeField(fieldHex, type);
                hexIndex += 2;
                break;
            case 'uint32':
                fieldHex = hex.slice(hexIndex, hexIndex + 8);
                decodedField = decodeField(fieldHex, type);
                hexIndex += 8;
                break;
            case 'uint64':
                fieldHex = hex.slice(hexIndex, hexIndex + 16);
                decodedField = decodeField(fieldHex, type);
                hexIndex += 16;
                break;
            case 'uint224':
                fieldHex = hex.slice(hexIndex, hexIndex + 56);
                decodedField = decodeField(fieldHex, type);
                hexIndex += 56;
                break;
            case 'varString':
                if (maxStringLength === undefined) {
                    throw Error('maxStringLength is required for type varString');
                }
                const prefixLengthHex = maxStringLength <= 2 ** 8 ? 2 : 4;
                const length = prefixLengthHex + maxStringLength * 2;
                fieldHex = hex.slice(hexIndex, hexIndex + length);
                decodedField = decodeField(fieldHex, type, maxStringLength);
                hexIndex += length;
                break;
            case 'xrpAddress':
                fieldHex = hex.slice(hexIndex, hexIndex + 72);
                decodedField = decodeField(fieldHex, type);
                hexIndex += 72;
                break;
            case 'model':
                if (fieldModelClass === undefined) {
                    throw Error('modelClass is required for type model');
                }
                const modelHexLength = BaseModel_1.BaseModel.getHexLength(fieldModelClass);
                fieldHex = hex.slice(hexIndex, hexIndex + modelHexLength);
                decodedField = decodeModel(hex, fieldModelClass);
                hexIndex += modelHexLength;
                break;
            case 'varModelArray':
                if (fieldModelClass === undefined) {
                    throw Error('modelClass is required for type varModelArray');
                }
                const lengthHex = hex.slice(hexIndex, hexIndex + 2);
                const varModelArrayLength = hexToUInt8(lengthHex);
                hexIndex += 2;
                const modelArray = [];
                for (let i = 0; i < varModelArrayLength; i++) {
                    const modelHexLength = BaseModel_1.BaseModel.getHexLength(fieldModelClass);
                    fieldHex = hex.slice(hexIndex, hexIndex + modelHexLength);
                    const decodedVaModelArrayElement = decodeModel(fieldHex, fieldModelClass);
                    modelArray.push(decodedVaModelArrayElement);
                    hexIndex += modelHexLength;
                }
                decodedField = modelArray;
                break;
            default:
                throw Error(`Unknown type: ${type}`);
        }
        model[field] = decodedField;
    }
    return model;
}
exports.decodeModel = decodeModel;
function decodeField(hex, type, maxStringLength) {
    switch (type) {
        case 'bool':
            return hexToUInt8(hex);
        case 'uint8':
            return hexToUInt8(hex);
        case 'uint32':
            return hexToUInt32(hex);
        case 'uint64':
            return hexToUInt64(hex);
        case 'uint224':
            return hexToUInt224(hex);
        case 'varString':
            if (maxStringLength === undefined) {
                throw Error('maxStringLength is required for type varString');
            }
            return hexToVarString(hex, maxStringLength);
        case 'xrpAddress':
            return hexToXRPAddress(hex);
        case 'model':
            throw Error('model type should be handled by decodeModel');
        case 'varModelArray':
            throw Error('varModelArray type should be handled by decodeModel');
        default:
            throw Error(`Unknown type: ${type}`);
    }
}
function hexToUInt8(hex) {
    return parseInt(hex, 16);
}
exports.hexToUInt8 = hexToUInt8;
function hexToUInt32(hex) {
    return parseInt(hex, 16);
}
exports.hexToUInt32 = hexToUInt32;
function hexToUInt64(hex) {
    return BigInt(`0x${hex}`);
}
exports.hexToUInt64 = hexToUInt64;
function hexToUInt224(hex) {
    return BigInt(`0x${hex}`);
}
exports.hexToUInt224 = hexToUInt224;
function hexToVarStringLength(hex, maxStringLength) {
    if (maxStringLength <= 2 ** 8) {
        return parseInt(hex.slice(0, 2), 16);
    }
    else if (maxStringLength <= 2 ** 16) {
        return parseInt(hex.slice(0, 4), 16);
    }
    throw Error('maxStringLength exceeds 2 bytes');
}
function hexToVarString(hex, maxStringLength) {
    const length = hexToVarStringLength(hex, maxStringLength);
    const prefixLength = (0, encode_1.lengthToHex)(length, maxStringLength);
    const content = hex.slice(prefixLength.length);
    return Buffer.from(content, 'hex').toString('utf8').slice(0, length);
}
exports.hexToVarString = hexToVarString;
function hexToXRPAddress(hex) {
    const length = hexToUInt8(hex.slice(0, 2));
    const value = Buffer.from(hex.slice(2), 'hex').toString('utf8');
    return value.slice(0, length);
}
exports.hexToXRPAddress = hexToXRPAddress;
//# sourceMappingURL=decode.js.map