import { BaseModel, ModelClass } from '../models/BaseModel';
import { UInt8, UInt32, UInt64, UInt224, VarString, XRPAddress } from './types';
export declare function decodeModel<T extends BaseModel>(hex: string, modelClass: ModelClass<T>): T;
export declare function hexToUInt8(hex: string): UInt8;
export declare function hexToUInt32(hex: string): UInt32;
export declare function hexToUInt64(hex: string): UInt64;
export declare function hexToUInt224(hex: string): UInt224;
export declare function hexToVarString(hex: string, maxStringLength: number): VarString;
export declare function hexToXRPAddress(hex: string): XRPAddress;
//# sourceMappingURL=decode.d.ts.map