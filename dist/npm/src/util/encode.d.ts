import { BaseModel } from '../models/BaseModel';
import { UInt8, UInt32, UInt64, UInt224, VarString, XRPAddress } from './types';
export declare function encodeModel<T extends BaseModel>(model: T): string;
export declare function uint8ToHex(value: UInt8): string;
export declare function uint32ToHex(value: UInt32): string;
export declare function uint64ToHex(value: UInt64): string;
export declare function uint224ToHex(value: UInt224): string;
export declare function lengthToHex(value: number, maxStringLength: number): string;
export declare function varStringToHex(value: VarString, maxStringLength: number): string;
export declare function xrpAddressToHex(value: XRPAddress): string;
//# sourceMappingURL=encode.d.ts.map