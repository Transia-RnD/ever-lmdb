import { deriveAddress } from 'xrpl'
import { Request, Response } from '../rules/types'
import { DbService } from './db'
import { User } from './types'
import { sign } from 'ripple-keypairs/dist'

export function prepareRequest(
  id: string,
  database: string,
  method: string,
  path: string,
  binary: string,
  publicKey: string,
  privateKey: string,
  metadata?: Record<string, any>
) {
  return {
    id: id,
    type: 'type',
    database: database,
    method: method,
    path: path,
    metadata: metadata,
    binary: binary,
    auth: {
      uid: deriveAddress(publicKey),
      signature: sign(binary, privateKey),
      pk: publicKey,
    },
  } as Request
}

export class ApiService {
  #dbService: DbService = null

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async handleRequest(user: User, request: Request, isReadOnly: boolean) {
    console.log('HANDLE REQUEST')
    let result
    this.#dbService = new DbService(request)
    if (request.method == 'POST') {
      result = await this.#dbService.create()
    }
    if (request.method == 'PUT') {
      result = await this.#dbService.update()
    }
    if (request.method == 'DELETE') {
      result = await this.#dbService.delete()
    }
    if (request.method == 'GET') {
      result = await this.#dbService.get()
    }

    if (isReadOnly) {
      await this.sendOutput(user, result)
    } else {
      await this.sendOutput(user, { id: request.id, ...result })
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendOutput = async (user: User, response: Response) => {
    await user.send(response)
  }
}
