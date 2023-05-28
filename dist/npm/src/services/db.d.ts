import { Request, Response } from '../rules/types';
export declare class DbService {
    #private;
    constructor(request: Request);
    create(id: string, data: Record<string, any>): Promise<Response>;
    create_binary(id: string, binary: string): Promise<Response>;
    get(id: string): Promise<Response>;
    update(id: string, data: Record<string, any>): Promise<Response>;
    update_binary(id: string, binary: string): Promise<Response>;
    delete(id: string): Promise<Response>;
}
//# sourceMappingURL=db.d.ts.map