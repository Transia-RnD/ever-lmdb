import { Request } from '../rules/types';
export declare class KeyPair {
    publicKey: string;
    privateKey: string;
    constructor(publicKey: string, privateKey: string);
}
export declare class CollectionReference {
    path: string;
    doc: DocumentReference;
    sdk: Sdk;
    constructor(path: string, doc?: DocumentReference | null, sdk?: Sdk | null);
    document(path: string): DocumentReference;
}
export declare class DocumentReference {
    path: string;
    col?: CollectionReference;
    constructor(path: string, col?: CollectionReference | null);
    get(): Promise<void>;
    set(binary: string): Promise<void>;
    update(binary: string): Promise<void>;
    delete(): Promise<void>;
    collection(path: string): void;
}
export declare class Sdk {
    client: any;
    keypair: KeyPair;
    database: string;
    promiseMap: Map<any, any>;
    constructor(database: string, keypair: KeyPair, client: any);
    collection(path: string): CollectionReference;
    submit(request: Request): Promise<unknown>;
    read(request: Request): Promise<any>;
}
//# sourceMappingURL=sdk.d.ts.map