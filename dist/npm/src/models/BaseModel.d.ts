export type ModelClass<T extends BaseModel> = new (...args: any[]) => T;
export type MetadataElement<T extends BaseModel> = {
    field: string;
    type: 'bool' | 'uint8' | 'uint32' | 'uint64' | 'uint224' | 'varString' | 'xrpAddress' | 'model' | 'varModelArray';
    maxStringLength?: number;
    modelClass?: ModelClass<T>;
    maxArrayLength?: number;
};
export type Metadata<T extends BaseModel = BaseModel> = MetadataElement<T>[];
export declare abstract class BaseModel {
    abstract getMetadata(): Metadata;
    encode(): string;
    static decode<T extends BaseModel>(hex: string, modelClass: ModelClass<T>): T;
    static getHexLength<T extends BaseModel>(modelClass: ModelClass<T>): number;
    private static createEmpty;
}
//# sourceMappingURL=BaseModel.d.ts.map