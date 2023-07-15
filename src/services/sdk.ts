import { convertStringToHex } from '@transia/xrpl'
import { prepareRequest } from './api'
import { Request } from '../rules/types'
import {
  BaseModel,
  ModelClass,
  decodeModel,
} from '@transia/hooks-toolkit/dist/npm/src/libs/binary-models'
import { v4 as uuidv4 } from 'uuid'
import { generateKey } from '../utils'

export class EverKeyPair {
  publicKey: string = null
  privateKey: string = null

  constructor(publicKey: string, privateKey: string) {
    this.publicKey = publicKey
    this.privateKey = privateKey
  }
}

export class CollectionReference {
  path: string = null
  doc: DocumentReference = null
  sdk: Sdk = null

  constructor(path: string, doc?: DocumentReference | null, sdk?: Sdk | null) {
    this.path = path
    this.doc = doc
    this.sdk = sdk
  }

  document(path?: string) {
    this.doc = new DocumentReference(path, this)
    return this.doc
  }
}

export class DocumentReference {
  modelClass: any
  path: string = null
  col?: CollectionReference = null

  constructor(path?: string, col?: CollectionReference | null) {
    this.path = path ? path : generateKey(32)
    this.col = col
  }

  withConverter<T extends BaseModel>(
    modelClass: ModelClass<T>
  ): DocumentReference {
    this.modelClass = modelClass
    return this
  }

  async read(request: Request): Promise<BaseModel> {
    try {
      const inpString = JSON.stringify(request)
      const client = await this.col.sdk.client.client
      const response = await client.submitContractReadRequest(inpString)

      if (response.error) {
        throw Error(response.error)
      }

      if (this.modelClass && response.snapshot && response.snapshot.binary) {
        return decodeModel(response.snapshot.binary, this.modelClass)
      }
      return response
    } catch (error) {
      throw error
    }
  }

  async custom<T extends BaseModel>(method: string, model: T) {
    const path = `/${this.col.path}/${this.col.doc.path}`
    // console.log(`CUSTOM: ${path}`)
    const request = prepareRequest(
      uuidv4(),
      'custom',
      this.col.sdk.database,
      method,
      path,
      model.encode(),
      this.col.sdk.keypair.publicKey,
      this.col.sdk.keypair.privateKey,
      model.getMetadata()
    )
    await this.col.sdk.submit(request)
  }

  async get() {
    const path = `/${this.col.path}/${this.col.doc.path}`
    // console.log(`GET: ${path}`)
    const request = prepareRequest(
      uuidv4(),
      'cloud.lmdb',
      this.col.sdk.database,
      'GET',
      path,
      convertStringToHex(path),
      this.col.sdk.keypair.publicKey,
      this.col.sdk.keypair.privateKey
    )
    return await this.read(request)
  }

  async set<T extends BaseModel>(model: T) {
    const path = `/${this.col.path}/${this.col.doc.path}`
    // console.log(`SET: ${path}`)
    const request = prepareRequest(
      uuidv4(),
      'cloud.lmdb',
      this.col.sdk.database,
      'POST',
      path,
      model.encode(),
      this.col.sdk.keypair.publicKey,
      this.col.sdk.keypair.privateKey,
      model.getMetadata()
    )
    await this.col.sdk.submit(request)
  }

  async update<T extends BaseModel>(model: T) {
    const path = `/${this.col.path}/${this.col.doc.path}`
    // console.log(`UPDATE: ${path}`)
    const request = prepareRequest(
      uuidv4(),
      'cloud.lmdb',
      this.col.sdk.database,
      'PUT',
      path,
      model.encode(),
      this.col.sdk.keypair.publicKey,
      this.col.sdk.keypair.privateKey,
      model.getMetadata()
    )
    await this.col.sdk.submit(request)
  }

  async delete() {
    const path = `/${this.col.path}/${this.col.doc.path}`
    // console.log(`DELETE: ${path}`)
    const request = prepareRequest(
      uuidv4(),
      'cloud.lmdb',
      this.col.sdk.database,
      'DELETE',
      path,
      convertStringToHex(path),
      this.col.sdk.keypair.publicKey,
      this.col.sdk.keypair.privateKey
    )
    await this.col.sdk.submit(request)
  }

  collection(path: string) {
    this.col = new CollectionReference(path, this)
  }
}

export class Sdk {
  client: any = null
  keypair: EverKeyPair = null
  database: string = null
  promiseMap = new Map()

  constructor(keypair: EverKeyPair, client: any, database?: string) {
    this.database = database ?? 'one'
    this.keypair = keypair
    this.client = client
  }

  collection(path: string) {
    return new CollectionReference(path, null, this)
  }

  async submit(request: Request) {
    let resolver, rejecter
    try {
      const inpString = JSON.stringify(request)
      this.client.client.submitContractInput(inpString).then((input: any) => {
        input.submissionStatus.then((s: any) => {
          if (s.status !== 'accepted') {
            // console.log(`Ledger_Rejection: ${s.reason}`)
            throw `Ledger_Rejection: ${s.reason}`
          }
          // console.log(`Ledger_Success`)
        })
      })

      return new Promise((resolve, reject) => {
        resolver = resolve
        rejecter = reject
        this.client.promiseMap.set(request.id, {
          resolver: resolver,
          rejecter: rejecter,
        })
      })
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}
