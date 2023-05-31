import { convertStringToHex } from 'xrpl'
import { prepareRequest } from './api'
import { Request } from '../rules/types'
import { BaseModel } from '../models'

export class EverKeyPair {
  publicKey: string = null
  privateKey: string = null

  constructor(publicKey: string, privateKey: string) {
    this.publicKey = publicKey
    this.privateKey = privateKey
  }

  fromHPKP(publicKey: string, privateKey: string): EverKeyPair {
    return new EverKeyPair(
      publicKey.toUpperCase(),
      privateKey.toUpperCase().slice(0, 66)
    )
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

  document(path: string) {
    this.doc = new DocumentReference(path, this)
    return this.doc
  }
}

export class DocumentReference {
  path: string = null
  col?: CollectionReference = null

  constructor(path: string, col?: CollectionReference | null) {
    this.path = path
    this.col = col
  }

  async get() {
    const path = `${this.col.path}/${this.col.doc.path}`
    console.log(`GET: ${path}`)
    const request = prepareRequest(
      '1',
      this.col.sdk.database,
      'GET',
      path,
      convertStringToHex(path),
      this.col.sdk.keypair.publicKey,
      this.col.sdk.keypair.privateKey
    )
    return await this.col.sdk.read(request)
  }

  async set<T extends BaseModel>(model: T) {
    const path = `${this.col.path}/${this.col.doc.path}`
    console.log(`SET: ${path}`)
    const request = prepareRequest(
      '1',
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
    const path = `${this.col.path}/${this.col.doc.path}`
    console.log(`UPDATE: ${path}`)
    const request = prepareRequest(
      '1',
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
    const path = `${this.col.path}/${this.col.doc.path}`
    console.log(`DELETE: ${path}`)
    const request = prepareRequest(
      '1',
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

  async read(request: Request) {
    try {
      const inpString = JSON.stringify(request)
      return await this.client.client.submitContractReadRequest(inpString)
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}
