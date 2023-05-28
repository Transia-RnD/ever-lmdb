import { validateRequestAgainstRules } from '../rules'
import { LMDBDatabase } from '../libs/lmdbHandler'
import { Request, Response, Rules } from '../rules/types'
import fs from 'fs'
import path from 'path'

function readFile(filename: string): string {
  const jsonString = fs.readFileSync(path.resolve(__dirname, `${filename}`))
  return jsonString.toString()
}

export class DbService {
  #request: Request = null
  #dbPath = ''
  #db: LMDBDatabase = null

  constructor(request: Request) {
    const path = request.path.split('/')[1]
    this.#request = request
    this.#dbPath = path
    this.#db = new LMDBDatabase(this.#dbPath)
  }

  // Creates a db record when a payload is sent
  async create(id: string, data: Record<string, any>) {
    console.log('CREATE DATA')
    // console.log(id)
    // console.log(data)
    const resObj: Response = {}
    try {
      this.#db.open()
      const rules: Rules = JSON.parse(readFile('rules.json'))
      validateRequestAgainstRules(this.#request, rules)
      await this.#db.create(id, JSON.stringify({ ...data }))
      resObj.snapshot = { id: id }
    } catch (error) {
      console.log('ERROR')

      resObj.error = `Error in creating the ${this.#dbPath} ${error}`
    } finally {
      this.#db.close()
    }
    // console.log(resObj);
    return resObj
  }

  // Creates a db record when a binary is sent
  async create_binary(id: string, binary: string) {
    console.log('CREATE BINARY')
    // console.log(id)
    // console.log(binary)
    const resObj: Response = {}
    try {
      this.#db.open()
      const rules: Rules = JSON.parse(readFile('rules.json'))
      validateRequestAgainstRules(this.#request, rules)
      await this.#db.create(id, binary)
      resObj.snapshot = { id: id }
    } catch (error: any) {
      resObj.error = error.message
    } finally {
      this.#db.close()
    }
    // console.log(resObj);
    return resObj
  }

  // Gets a db record for a payload key
  async get(id: string) {
    console.log('GET')
    // console.log(id)
    const resObj: Response = {}
    try {
      this.#db.open()
      const rules: Rules = JSON.parse(readFile('rules.json'))
      validateRequestAgainstRules(this.#request, rules)
      const result = await this.#db.get(id)
      resObj.snapshot = { binary: result }
    } catch (error: any) {
      resObj.error = error.message
    } finally {
      this.#db.close()
    }
    return resObj
  }

  // Update a db record for a payload key
  async update(id: string, data: Record<string, any>) {
    console.log('UPDATE')
    // console.log(id)
    // console.log(data)

    const resObj: Response = {}
    try {
      this.#db.open()
      const rules: Rules = JSON.parse(readFile('rules.json'))
      validateRequestAgainstRules(this.#request, rules)
      const result = await this.#db.update(id, JSON.stringify({ ...data }))
      resObj.snapshot = { data: result }
    } catch (error: any) {
      resObj.error = error.message
    } finally {
      this.#db.close()
    }
    return resObj
  }

  // Update a db record for a payload key
  async update_binary(id: string, binary: string) {
    console.log('UPDATE')
    // console.log(id)
    // console.log(binary)

    const resObj: Response = {}
    try {
      this.#db.open()
      const rules: Rules = JSON.parse(readFile('rules.json'))
      validateRequestAgainstRules(this.#request, rules)
      const result = await this.#db.update(id, binary)
      resObj.snapshot = { data: result }
    } catch (error: any) {
      resObj.error = error.message
    } finally {
      this.#db.close()
    }
    return resObj
  }

  // Deletes a db record for a payload key
  async delete(id: string) {
    console.log('DELETE')
    // console.log(id)
    const resObj: Response = {}
    try {
      this.#db.open()
      const rules: Rules = JSON.parse(readFile('rules.json'))
      validateRequestAgainstRules(this.#request, rules)
      const result = await this.#db.delete(id)
      console.log(result)
      resObj.snapshot = { data: null }
    } catch (error) {
      resObj.error = `Error in deleting the ${this.#dbPath} ${error}`
    } finally {
      this.#db.close()
    }
    return resObj
  }
}
