import { Request, Response } from '../rules/types';
import { User } from './types';
export declare function prepareRequest(id: string, database: string, method: string, path: string, binary: string, publicKey: string, privateKey: string): Request;
export declare class ApiService {
    #private;
    constructor();
    handleRequest(user: User, request: Request, isReadOnly: boolean): Promise<void>;
    sendOutput: (user: User, response: Response) => Promise<void>;
}
//# sourceMappingURL=api.d.ts.map