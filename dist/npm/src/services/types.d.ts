/// <reference types="node" />
export interface User {
    publicKey: string;
    inputs: Buffer[];
    send: (response: any) => void;
}
export interface Users {
    users: User[];
}
//# sourceMappingURL=types.d.ts.map