"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageModel = void 0;
const BaseModel_1 = require("./BaseModel");
class MessageModel extends BaseModel_1.BaseModel {
    constructor(updatedTime, updatedBy, message) {
        super();
        this.updatedTime = updatedTime;
        this.updatedBy = updatedBy;
        this.message = message;
    }
    getMetadata() {
        return [
            { field: 'updatedTime', type: 'uint64' },
            { field: 'updatedBy', type: 'varString', maxStringLength: 32 },
            { field: 'message', type: 'varString', maxStringLength: 250 },
        ];
    }
    toJSON() {
        return {
            updatedTime: this.updatedTime,
            updatedBy: this.updatedBy,
            message: this.message,
        };
    }
}
exports.MessageModel = MessageModel;
//# sourceMappingURL=Message.js.map