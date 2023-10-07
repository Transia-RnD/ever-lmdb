import { RulesService } from '../rules'
import { LMDBDatabase } from '../libs/lmdbHandler'
import { Request, Response, Rules } from '../rules/types'
import fs from 'fs'
import path from 'path'
import { convertStringToHex, deriveAddress } from '@transia/xrpl'
import { LogEmitter } from './logger'

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
  #id: string = null
  #request: Request = null
  #db: LMDBDatabase = null
  #rules: RulesService = null
  logger: LogEmitter = null

  constructor(id: string, request: Request) {
    const name = 'one'
    this.#id = id
    this.#request = request
    this.#db = new LMDBDatabase(this.#id, name)
    this.logger = new LogEmitter(this.#id, 'db')
  }

  loadrules(): void {
    try {
      const rules = JSON.parse(
        readFile(path.join(process.cwd(), 'rules.json'))
      ) as Rules
      this.#rules = new RulesService(this.#id, this.#request, rules, this.#db)
    } catch (error: any) {
      this.logger.error(error.message)
      throw error
    }
  }

  // Creates a db record
  async create(): Promise<Response> {
    const resObj: Response = {}
    try {
      this.#db.open()
      await this.#rules.validateRequestAgainstRules()
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
    // this.logger.info('DB GET')
    const resObj: Response = {}
    try {
      this.#db.open()
      this.logger.info('DB: Open')

      await this.#rules.validateRequestAgainstRules()
      this.logger.info('DB: Validated')
      const id = convertStringToHex(this.#request.path)
      const result = await this.#db.get(id)
      resObj.snapshot = { ...JSON.parse(result) }
      if (resObj.snapshot) {
        this.#rules.validateXrplAuth(
          resObj.snapshot.binary,
          resObj.snapshot.sig,
          resObj.snapshot.pk,
          deriveAddress(resObj.snapshot.pk)
        )
        this.logger.info('DB: XRPL VALID')
      }
    } catch (error: any) {
      this.logger.info('DB: ERROR')
      resObj.error = error.message
    } finally {
      this.logger.info('DB: FINALLY')
      this.#db.close()
    }
    this.logger.info('DB: RETURN')
    console.log(resObj)

    return resObj
  }

  // List a db collection
  async list(): Promise<Response> {
    this.logger.info('DB LIST')
    const resObj: Response = {}
    try {
      this.#db.open()
      this.logger.info('DB: Open')

      // await this.#rules.validateRequestAgainstRules()
      this.logger.info('DB: Validated')

      const collection = convertStringToHex(this.#request.path)
      const results = await this.#db.list(1, 10, collection)
      resObj.snapshots = results
      // if (resObj.snapshot) {
      //   this.#rules.validateXrplAuth(
      //     resObj.snapshot.binary,
      //     resObj.snapshot.sig,
      //     resObj.snapshot.pk,
      //     deriveAddress(resObj.snapshot.pk)
      //   )
      //   this.logger.info('DB: XRPL VALID')
      // }
    } catch (error: any) {
      this.logger.info('DB: ERROR')
      resObj.error = error.message
    } finally {
      this.logger.info('DB: FINALLY')
      this.#db.close()
    }
    this.logger.info('DB: RETURN')
    console.log(resObj)
    return resObj
  }

  // Update a db record
  async update(): Promise<Response> {
    // this.logger.info('DB UPDATE')
    const resObj: Response = {}
    try {
      this.#db.open()
      await this.#rules.validateRequestAgainstRules()
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
    // this.logger.info('DB DELETE')
    // this.logger.info(id)
    const resObj: Response = {}
    try {
      this.#db.open()
      await this.#rules.validateRequestAgainstRules()
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
