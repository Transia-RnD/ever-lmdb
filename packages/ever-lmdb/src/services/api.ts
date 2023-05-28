import { deriveAddress } from '@transia/xrpl'
import { Request, Response } from '../rules/types'
import { DbService } from './db'
import { User } from './types'
import { sign } from '@transia/ripple-keypairs/dist'

export function prepareRequest(
  id: string,
  database: string,
  method: string,
  path: string,
  binary: string,
  publicKey: string,
  privateKey: string
) {
  return {
    id: id,
    database: database,
    method: method,
    path: path,
    binary: binary,
    auth: {
      type: 'xrpl',
      uid: deriveAddress(publicKey),
      signature: sign(binary, privateKey),
      pk: publicKey,
    },
  } as Request
}

export class ApiService {
  #dbService: DbService = null

  constructor() {
    console.log('CONSTRUCTOR')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async handleRequest(user: User, request: Request, isReadOnly: boolean) {
    console.log('HANDLE REQUEST')
    // console.log(request)
    // console.log(request.binary)
    let result
    // const collection = request.path.split('/')[1]
    this.#dbService = new DbService(request)
    const id = request.path.split('/').pop()
    if (request.method == 'POST') {
      result = await this.#dbService.create_binary(id, request.binary)
    }
    if (request.method == 'PUT') {
      result = await this.#dbService.update_binary(id, request.binary)
    }
    if (request.method == 'DELETE') {
      result = await this.#dbService.delete(id)
    }
    if (request.method == 'GET') {
      result = await this.#dbService.get(id)
    }

    // console.log(result)

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
