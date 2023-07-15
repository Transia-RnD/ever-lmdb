import { validateRequestAgainstRules, validateXrplAuth } from '../rules'
import { LMDBDatabase } from '../libs/lmdbHandler'
import { Request, Response, Rules } from '../rules/types'
import fs from 'fs'
import path from 'path'
import { convertStringToHex, deriveAddress } from '@transia/xrpl'

function readFile(filename: string): string {
  const jsonString = fs.readFileSync(path.resolve(__dirname, `${filename}`))
  return jsonString.toString()
}

interface XrplLmdbEntry {
  binary: string
  metadata: Record<string, any>
  sig: string
  pk: string
}

export class DbService {
  #request: Request = null
  #db: LMDBDatabase = null
  #rules: Rules = null

  constructor(request: Request) {
    this.#request = request
    this.#db = new LMDBDatabase('one')
  }

  loadrules(): void {
    try {
      this.#rules = JSON.parse(readFile(path.join(process.cwd(), 'rules.json')))
    } catch (error: any) {
      console.log(error.message)
      throw error
    }
  }

  // Creates a db record
  async create(): Promise<Response> {
    const resObj: Response = {}
    try {
      this.#db.open()
      await validateRequestAgainstRules(this.#request, this.#rules, this.#db)
      const id = convertStringToHex(this.#request.path)
      const bytes = Buffer.from(
        JSON.stringify({
          binary: this.#request.binary,
          metadata: this.#request.metadata,
          sig: this.#request.auth.signature,
          pk: this.#request.auth.pk,
        } as XrplLmdbEntry)
      )
      await this.#db.create(id, bytes)
      resObj.id = this.#request.id
      resObj.snapshot = { id: id }
    } catch (error: any) {
      resObj.error = error.message
    } finally {
      this.#db.close()
    }
    return resObj
  }

  // Gets a db record
  async get(): Promise<Response> {
    // console.log('DB GET')
    const resObj: Response = {}
    try {
      this.#db.open()
      await validateRequestAgainstRules(this.#request, this.#rules, this.#db)
      const id = convertStringToHex(this.#request.path)
      const result = await this.#db.get(id)
      resObj.snapshot = { ...JSON.parse(result) }
      if (resObj.snapshot) {
        validateXrplAuth(
          resObj.snapshot.binary,
          resObj.snapshot.sig,
          resObj.snapshot.pk,
          deriveAddress(resObj.snapshot.pk)
        )
      }
    } catch (error: any) {
      resObj.error = error.message
    } finally {
      this.#db.close()
    }
    return resObj
  }

  // Update a db record
  async update(): Promise<Response> {
    // console.log('DB UPDATE')
    const resObj: Response = {}
    try {
      this.#db.open()
      await validateRequestAgainstRules(this.#request, this.#rules, this.#db)
      const id = convertStringToHex(this.#request.path)
      const bytes = Buffer.from(
        JSON.stringify({
          binary: this.#request.binary,
          metadata: this.#request.metadata,
          sig: this.#request.auth.signature,
          pk: this.#request.auth.pk,
        } as XrplLmdbEntry)
      )
      await this.#db.update(id, bytes)
      resObj.id = id
    } catch (error: any) {
      resObj.error = error.message
    } finally {
      this.#db.close()
    }
    return resObj
  }

  // Deletes a db record
  async delete(): Promise<Response> {
    // console.log('DB DELETE')
    // console.log(id)
    const resObj: Response = {}
    try {
      this.#db.open()
      await validateRequestAgainstRules(this.#request, this.#rules, this.#db)
      const id = convertStringToHex(this.#request.path)
      await this.#db.delete(id)
      resObj.snapshot = { id: id }
    } catch (error: any) {
      resObj.error = error.message
    } finally {
      this.#db.close()
    }
    return resObj
  }
}
