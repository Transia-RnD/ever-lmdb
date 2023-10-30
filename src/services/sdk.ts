import { convertStringToHex } from '@transia/xrpl'
import {
  BaseModel,
  ModelClass,
  decodeModel,
} from '@transia/hooks-toolkit/dist/npm/src/libs/binary-models'
import { v4 as uuidv4 } from 'uuid'
import { generateKey } from '../utils'
import { prepareRequest, Request } from './types'

export class EverKeyPair {
  publicKey: string = null
  privateKey: string = null

  constructor(publicKey: string, privateKey: string) {
    this.publicKey = publicKey
    this.privateKey = privateKey
  }
}

export class CollectionReference {
  modelClass: any
  path: string = null
  doc: DocumentReference = null
  parent: CollectionReference = null
  sdk: Sdk = null

  constructor(
    path: string,
    doc?: DocumentReference | null,
    parent?: CollectionReference,
    sdk?: Sdk | null
  ) {
    this.path = path
    this.doc = doc
    this.parent = parent
    this.sdk = sdk
  }

  getPath() {
    let path = `/${this.path}`
    if (this.parent) {
      console.log(this.parent)
      path = `/${this.parent.path}/${this.doc.path}` + path
    }
    return path
  }

  withConverter<T extends BaseModel>(
    modelClass: ModelClass<T>
  ): CollectionReference {
    this.modelClass = modelClass
    return this
  }

  document(path?: string) {
    return new DocumentReference(path, this)
  }

  async list() {
    const path = this.getPath()
    console.log(`LIST: ${path}`)
    const request = prepareRequest(
      uuidv4(),
      'cloud.lmdb',
      this.sdk.database,
      'LIST',
      path,
      convertStringToHex(path),
      this.sdk.keypair.publicKey,
      this.sdk.keypair.privateKey
    )
    return await this.read(request)
  }

  async read(request: Request): Promise<BaseModel | BaseModel[]> {
    try {
      // this.col.sdk.logger.info('SDK: READ')
      const inpString = JSON.stringify(request)
      const client = await this.sdk.client.client
      const response = await client.submitContractReadRequest(inpString)
      // this.col.sdk.logger.info('SDK: READ RESPONSE')
      if (response && response.error) {
        // this.col.sdk.logger.error('SDK: READ ERROR')
        throw Error(response.error)
      }

      if (response && this.modelClass && response.snapshots) {
        // this.col.sdk.logger.info('SDK: READ DECODE')
        const results = []
        for (let index = 0; index < response.snapshots.length; index++) {
          results.push(
            decodeModel(response.snapshots[index].binary, this.modelClass)
          )
        }
        return results
      }
      // this.col.sdk.logger.info('SDK: READ RESPONSE')
      return response
    } catch (error) {
      // this.col.sdk.logger.info('SDK: READ ERROR')
      throw error
    }
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

  getPath() {
    let path = `/${this.col.path}/${this.path}`
    if (this.col.parent) {
      path = `/${this.col.parent.path}/${this.col.doc.path}` + path
    }
    return path
  }

  withConverter<T extends BaseModel>(
    modelClass: ModelClass<T>
  ): DocumentReference {
    this.modelClass = modelClass
    return this
  }

  async read(request: Request): Promise<BaseModel | BaseModel[]> {
    try {
      // this.col.sdk.logger.info('SDK: READ')
      const inpString = JSON.stringify(request)
      const client = await this.col.sdk.client.client
      const response = await client.submitContractReadRequest(inpString)
      // this.col.sdk.logger.info('SDK: READ RESPONSE')
      if (response && response.error) {
        // this.col.sdk.logger.error('SDK: READ ERROR')
        throw Error(response.error)
      }

      if (
        response &&
        this.modelClass &&
        response.snapshot &&
        response.snapshot.binary
      ) {
        // this.col.sdk.logger.info('SDK: READ DECODE')
        return decodeModel(response.snapshot.binary, this.modelClass)
      }
      // this.col.sdk.logger.info('SDK: READ RESPONSE')
      return response
    } catch (error) {
      // this.col.sdk.logger.info('SDK: READ ERROR')
      throw error
    }
  }

  async custom<T extends BaseModel>(method: string, model: T) {
    const path = this.getPath()
    console.log(`CUSTOM: ${path}`)
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
    const path = this.getPath()
    console.log(`GET: ${path}`)
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
    const path = this.getPath()
    console.log(`SET: ${path}`)
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
    const path = this.getPath()
    console.log(`UPDATE: ${path}`)
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
    const path = this.getPath()
    // this.logger.info(`DELETE: ${path}`)
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
    return new CollectionReference(path, this, this.col, this.col.sdk)
  }
}

export class Sdk {
  // logger: LogEmitter = null
  client: any = null
  keypair: EverKeyPair = null
  database: string = null
  promiseMap = new Map()

  constructor(
    // logger: LogEmitter,
    keypair: EverKeyPair,
    client: any,
    database?: string
  ) {
    this.database = database ?? 'one'
    this.keypair = keypair
    this.client = client
    // this.logger = logger
  }

  collection(path: string) {
    return new CollectionReference(path, null, null, this)
  }

  async submit(request: Request) {
    let resolver, rejecter
    try {
      // this.logger.info('SDK: SUBMIT')
      const inpString = JSON.stringify(request)
      this.client.client.submitContractInput(inpString).then((input: any) => {
        // this.logger.info('SDK: SUBMIT INPUT')
        input.submissionStatus.then((s: any) => {
          // this.logger.info('SDK: SUBMIT STATUS')
          if (s.status !== 'accepted') {
            // this.logger.error(`SDK: Ledger_Rejection: ${s.reason}`)
            throw Error(`Ledger_Rejection: ${s.reason}`)
          }
          // this.logger.info(`SDK: Ledger_Success`)
        })
      })
      // this.logger.info('SDK: SUBMIT PROMISE')
      return new Promise((resolve, reject) => {
        resolver = resolve
        rejecter = reject
        this.client.promiseMap.set(request.id, {
          resolver: resolver,
          rejecter: rejecter,
        })
      })
    } catch (error: any) {
      // this.logger.error(error.message)
      throw error
    }
  }
}
