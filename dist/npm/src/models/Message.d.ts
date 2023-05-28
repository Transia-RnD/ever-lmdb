import { BaseModel, Metadata } from './BaseModel';
import { UInt64, VarString } from '../util/types';
export declare class MessageModel extends BaseModel {
    updatedTime: UInt64;
    updatedBy: VarString;
    message: VarString;
    constructor(updatedTime: UInt64, updatedBy: VarString, message: VarString);
    getMetadata(): Metadata;
    toJSON(): {
        updatedTime: bigint;
        updatedBy: string;
        message: string;
    };
}
//# sourceMappingURL=Message.d.ts.map