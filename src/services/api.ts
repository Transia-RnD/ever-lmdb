import { Request, Response } from '../rules/types'
import { DbService } from './db'
import { LogEmitter } from './logger'

export class ApiService {
  #id: string = null
  #dbService: DbService = null
  logger: LogEmitter = null

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(id: string) {
    this.#id = id
    this.logger = new LogEmitter(this.#id, 'api')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async handleRequest(
    id: string,
    user: any,
    request: Request,
    isReadOnly: boolean
  ) {
    this.logger.info('API: REQUEST')
    let result

    try {
      this.#dbService = new DbService(this.#id, request)
      this.#dbService.loadrules()
      this.logger.info('API: LOAD RULES')

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
        this.logger.info('API: READONLY')
        await this.sendOutput(user, result)
      } else {
        this.logger.info('API: SUBMIT')
        await this.sendOutput(user, { id: request.id, ...result })
      }
    } catch (error: any) {
      this.logger.error(error.message)
      await this.sendOutput(user, {
        id: request.id,
        error: error.message,
      } as Response)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendOutput = async (user: any, response: Response) => {
    try {
      this.logger.info('API: SEND')
      await user.send(response)
    } catch (error: any) {
      this.logger.error(error.message)
    }
  }
}
