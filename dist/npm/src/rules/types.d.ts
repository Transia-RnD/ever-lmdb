export interface Auth {
    uid: string;
    type: string;
    signature: string;
    pk: string;
}
export interface Request {
    id: string;
    type: string;
    database: string;
    method: string;
    path: string;
    data?: Record<string, any>;
    binary?: string | null;
    auth?: Auth;
}
export interface Response {
    id?: string;
    snapshot?: Record<string, any>;
    error?: string;
}
export interface Rules {
    rules_version: string;
    service: string;
    [key: string]: any;
}
export interface Rule {
    read: boolean | string;
    write: boolean | string;
    [key: string]: any;
}
//# sourceMappingURL=types.d.ts.map