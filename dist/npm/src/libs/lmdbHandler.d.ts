import { Dbi, Env } from 'node-lmdb';
export declare class LMDBDatabase {
    env: Env;
    db: Dbi;
    characters: string;
    dbCollection: string;
    openConnections: number;
    constructor(dbCollection: string);
    open(): void;
    close(): void;
    create(key: string, binary: string): string;
    get(key: string): Promise<string>;
    update(key: string, binary: string): Promise<true | {
        error: string;
        status: string;
        type: string;
    }>;
    delete(key: string): Promise<boolean>;
    generateKey(length: number): string;
}
//# sourceMappingURL=lmdbHandler.d.ts.map