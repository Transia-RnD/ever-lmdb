"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseModel = void 0;
const encode_1 = require("../util/encode");
const decode_1 = require("../util/decode");
class BaseModel {
    encode() {
        return (0, encode_1.encodeModel)(this);
    }
    static decode(hex, modelClass) {
        return (0, decode_1.decodeModel)(hex, modelClass);
    }
    static getHexLength(modelClass) {
        const metadata = modelClass.prototype.getMetadata();
        let length = 0;
        for (const { type, maxStringLength, modelClass: fieldModelClass, } of metadata) {
            switch (type) {
                case 'bool':
                    length += 2;
                    break;
                case 'uint8':
                    length += 2;
                    break;
                case 'uint32':
                    length += 8;
                    break;
                case 'uint64':
                    length += 16;
                    break;
                case 'uint224':
                    length += 56;
                    break;
                case 'varString':
                    if (maxStringLength === undefined) {
                        throw Error('maxStringLength is required for type varString');
                    }
                    length += maxStringLength * 2 + (maxStringLength <= 2 ** 8 ? 2 : 4);
                    break;
                case 'xrpAddress':
                    length += 72;
                    break;
                case 'model':
                    length += BaseModel.getHexLength(fieldModelClass);
                    break;
                case 'varModelArray':
                    throw Error("varModelArray hex length doesn't need to be computed for this application; only its model elements only do. However, this will fail if getHexLength is called on a model that contains a varModelArray. Will need to be updated if this is ever needed.");
                default:
                    throw Error(`Unknown type: ${type}`);
            }
        }
        return length;
    }
    static createEmpty(modelClass) {
        const modelArgs = modelClass.prototype
            .getMetadata()
            .map((metadata) => {
            switch (metadata.type) {
                case 'bool':
                    return 0;
                case 'uint8':
                    return 0;
                case 'uint32':
                    return 0;
                case 'uint64':
                    return BigInt(0);
                case 'uint224':
                    return BigInt(0);
                case 'varString':
                    return '';
                case 'xrpAddress':
                    return '';
                case 'model':
                    if (metadata.modelClass === undefined) {
                        throw Error('modelClass is required for type model');
                    }
                    return BaseModel.createEmpty(metadata.modelClass);
                default:
                    throw Error(`Unknown type: ${metadata.type}`);
            }
        });
        return new modelClass(...modelArgs);
    }
}
exports.BaseModel = BaseModel;
//# sourceMappingURL=BaseModel.js.map