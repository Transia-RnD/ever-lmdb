import { convertStringToHex, deriveAddress } from '@transia/xrpl'
import { Auth, Request, Rule, Rules } from './types'
import { verify } from '@transia/ripple-keypairs/dist'
import { LMDBDatabase } from '../libs'
import {
  Metadata,
  decodeMetadata,
} from '@transia/hooks-toolkit/dist/npm/src/libs/binary-models'
import { LogEmitter } from '../services/logger'

interface FunctionMatch {
  path: string
  function: string
  var: string
}
interface DataMatch {
  function: string
  type: string
  var: string
  mapVar?: string | undefined
  compare: string
}

interface PathMatch {
  ruleName: string
  reqName: string
  ruleVar: string
  reqVar: string
}

export class RulesService {
  #id: string = null
  #request: Request = null
  #db: LMDBDatabase = null
  #rules: Rules = null
  logger: LogEmitter = null

  constructor(
    id: string,
    request: Request,
    rules: Rules,
    db?: LMDBDatabase | null
  ) {
    this.#id = id
    this.#request = request
    this.#rules = rules
    this.#db = db
    this.logger = new LogEmitter(this.#id, 'rules')
  }

  parseFunction(path: string) {
    const pattern =
      /(\!?get|\!?exists|\!?getAfter)?\((.*)\).([a-zA-Z]+.[a-zA-Z]+)/
    const functionMatch = path.match(pattern)
    // this.logger.info(`FULL PATH: ${path}`)
    // this.logger.info(`FUNCTION MATCH: ${functionMatch}`)
    if (functionMatch && functionMatch[0] && functionMatch[1]) {
      // this.logger.info('MATCHED FUNCTION')
      return {
        function: functionMatch[1],
        path: functionMatch[2],
        var: functionMatch[3],
      } as FunctionMatch
    }
    // this.logger.info('NO MATCHED FUNCTION')
    return {} as FunctionMatch
  }

  parseGetData(path: string) {
    const pattern =
      /\.data\.([a-zA-Z]+)\s==\s(.*)\s\&\&|\.data.(([a-zA-Z]+)[\.](includes)\(\{([a-zA-Z]+)\}\,\s\{([a-zA-Z.]+)\}\))/
    const dataMatch = path.match(pattern)
    if (dataMatch && dataMatch.length == 8) {
      // this.logger.info(`MATCHED: ${dataMatch[5]}`)
      return {
        function: dataMatch[5],
        type: 'map',
        var: dataMatch[4],
        mapVar: dataMatch[6],
        compare: dataMatch[7],
      } as DataMatch
    }
    if (dataMatch && dataMatch[1]) {
      // this.logger.info('MATCHED: COMPARE')
      return {
        var: dataMatch[1],
        compare: dataMatch[2],
      } as DataMatch
    }
    // this.logger.info('NO MATCHED DATA')
    return {} as DataMatch
  }

  parseData(path: string) {
    const pattern = /request\.resource\.data\.([a-zA-Z]+)\s==\s(.*)\s?\&?\&?/
    const dataMatch = path.match(pattern)
    // this.logger.info(`FULL PATH: ${path}`)
    // this.logger.info(`DATA MATCH: ${dataMatch}`)
    if (dataMatch && dataMatch[1]) {
      // this.logger.info('MATCHED DATA')
      return {
        var: dataMatch[1],
        compare: dataMatch[2],
      } as DataMatch
    }
    // this.logger.info('NO MATCHED DATA')
    return {} as DataMatch
  }

  async validateFunction(
    req: Request,
    db: LMDBDatabase,
    rullPath: string,
    reqPath: string
  ): Promise<boolean> {
    // this.logger.info(`FUNC VALIDATE: ${rullPath}`)
    const funcMatch = this.parseFunction(rullPath)
    if (funcMatch.function === 'exists' || funcMatch.function === '!exists') {
      // this.logger.info('EXISTS FUNCTION VALIDATION')
      const isFlipped = funcMatch.function[0] === '!' ? true : false
      try {
        await db.get(convertStringToHex(reqPath))
        if (!isFlipped) {
          throw Error('Invalid Permissions')
        }
      } catch (error: any) {
        if (isFlipped) {
          throw Error('Invalid Permissions')
        }
      }
    } else if (funcMatch.function === 'get' || funcMatch.function === '!get') {
      // this.logger.info('GET FUNCTION VALIDATION')
      try {
        const response = await db.get(convertStringToHex(reqPath))
        const data = JSON.parse(response)
        const decoded = decodeMetadata(data.binary, data.metadata as Metadata)
        const dataMatch = this.parseGetData(rullPath)
        if (dataMatch.function === 'includes') {
          const variable: any[] = decoded[dataMatch.var as string]
          const compareValue =
            dataMatch.compare === 'request.auth.uid'
              ? this.#request.auth.uid
              : dataMatch.compare

          if (dataMatch.type === 'map') {
            if (
              variable.findIndex(
                (i) => i[dataMatch.mapVar as string] === compareValue
              ) === -1
            ) {
              return false
            }
          } else {
            return variable.includes(compareValue)
          }
        } else {
          if (
            decoded[dataMatch.var as string] ===
            (dataMatch.compare === 'request.auth.uid'
              ? this.#request.auth.uid
              : dataMatch.compare)
          ) {
            // this.logger.info('GET DATA MATCH RULE')
            return true
          }
        }
      } catch (error: any) {
        this.logger.error(error.message)
        return false
      }
    }
    return true
  }

  validateXrplAuth(
    binary: string,
    signature: string,
    pk: string,
    uid: string
  ): void {
    if (!binary || !signature || !pk) {
      // this.logger.error('RULES: XRPL Invalid Xrpl Validation')
      throw Error('Invalid Xrpl Validation')
    }
    // this.logger.info('VALIDATE XRPL DATA')
    if (verify(binary, signature, pk) && deriveAddress(pk) === uid) {
      // this.logger.error('RULES: XRPL SUCCESS')
      return
    }
    // this.logger.error('RULES: XRPL Invalid Xrpl Validation')
    throw Error('Invalid Xrpl Validation')
  }

  async validateAuth(
    db: LMDBDatabase,
    str: string,
    pathMatch: PathMatch,
    req: Request
  ): Promise<void> {
    this.logger.info('RULES: `validateAuth` TRIGGERED')
    const auth = this.#request.auth as Auth
    if (
      str.includes('request.auth.uid') &&
      str.includes('request.auth.uid != null')
    ) {
      if (auth.uid === null) {
        this.logger.error('RULES: `validateAuth` Auth must not be null')
        throw Error('Invalid Permissions: Auth must not be null')
      }
    }
    if (
      str.includes('request.auth.uid') &&
      str.includes(`request.auth.uid == ${pathMatch.ruleVar}`)
    ) {
      if (auth.uid !== pathMatch.reqVar) {
        this.logger.error(
          'RULES: `validateAuth` Invalid Permissions: Invalid Id'
        )
        throw Error('Invalid Permissions: Invalid Id')
      }
    }

    if (!auth.signature || !auth.pk) {
      this.logger.error(
        'RULES: `validateAuth` Invalid Xrpl Signature Parameters'
      )
      throw Error('Invalid Xrpl Signature Parameters')
    }
    this.validateXrplAuth(
      this.#request.binary as string,
      auth.signature as string,
      auth.pk as string,
      auth.uid as string
    )
    const reqPath = `/${pathMatch.reqName}/${pathMatch.reqVar}`
    if (!(await this.validateFunction(req, db, str, reqPath))) {
      this.logger.error(
        'RULES: `validateAuth` `validateFunction` Invalid Permissions'
      )
      throw Error('Invalid Permissions')
    }
    this.logger.info('RULES: `validateAuth` FALLTHROUGH')
    return
  }

  async validateChildAuth(
    db: LMDBDatabase,
    str: string,
    parentMatch: PathMatch,
    childMatch: PathMatch,
    req: Request
  ): Promise<void> {
    this.logger.info('RULES: `validateChildAuth` TRIGGERED')
    const auth = this.#request.auth as Auth
    if (
      str.includes('request.auth.uid') &&
      str.includes('request.auth.uid != null')
    ) {
      if (auth.uid === null) {
        this.logger.error('RULES: `validateChildAuth` Auth must not be null')
        throw Error('Invalid Permissions: Auth must not be null')
      }
    }
    if (
      str.includes('request.auth.uid') &&
      str.includes(`request.auth.uid == ${childMatch.ruleVar}`)
    ) {
      if (auth.uid !== childMatch.reqVar) {
        this.logger.error(
          'RULES: `validateChildAuth` Invalid Permissions: Invalid Id'
        )
        throw Error('Invalid Permissions: Invalid Id')
      }
    }
    if (!auth.signature || !auth.pk) {
      this.logger.error(
        'RULES: `validateChildAuth` Invalid Xrpl Signature Parameters'
      )
      throw Error('Invalid Xrpl Signature Parameters')
    }
    this.validateXrplAuth(
      this.#request.binary as string,
      auth.signature as string,
      auth.pk as string,
      auth.uid as string
    )
    const parentPath = `/${parentMatch.reqName}/${parentMatch.reqVar}`
    // const reqPath = parentPath + `/${childMatch.reqName}/${childMatch.reqVar}`
    if (!(await this.validateFunction(req, db, str, parentPath))) {
      this.logger.error(
        'RULES: `validateChildAuth` `validateFunction` Invalid Permissions'
      )
      throw Error('Invalid Permissions')
    }
    this.logger.error('RULES: `validateChildAuth` FALLTHROUGH')
    return
  }

  parsePath(path: string, reqPath: string) {
    // this.logger.info(`RULE PATH: ${path}`)
    // this.logger.info(`REQ PATH: ${reqPath}`)
    const pattern =
      /^\/([A-Za-z0-9]+)\/\{([A-Za-z0-9]+)\}\/?([A-Za-z0-9]+)?\/?\{?([A-Za-z0-9]+)?\}?/
    const pathMatch = path.match(pattern)
    // console.info('RULES: `parsePath` PATH MATCH')
    if (pathMatch) {
      if (!pathMatch[1] || !pathMatch[2]) {
        // this.logger.error('invalid collection / document index')
        return {} as PathMatch
      }
      const reqPattern =
        /^\/([A-Za-z0-9]+)\/([A-Za-z0-9]+)\/?([A-Za-z0-9]+)?\/?([A-Za-z0-9]+)?/
      const reqMatch = reqPath.match(reqPattern)
      // console.info('RULES: `parsePath` REQ PATH MATCH')
      return {
        ruleName: pathMatch[1],
        reqName: reqMatch[1],
        ruleVar: pathMatch[2],
        reqVar: reqMatch[2],
      } as PathMatch
    }
    // this.logger.error('RULES: `parsePath` FALLTHROUGH ')
    return {} as PathMatch
  }

  async validateRequestAgainstRules(): Promise<void> {
    this.logger.info('RULES: VALIDATE')
    const dbRules: string[] = Object.keys(
      this.#rules['/databases/{database}/documents']
    )
    let validated = false
    // Layer 1
    for (let i = 0; i < dbRules.length; i++) {
      this.logger.info('RULES: RULE')
      const dbRule = dbRules[i]
      const pathMatch = this.parsePath(dbRule, this.#request.path)

      // LAYER 2
      if (this.#request.path.split('/').length === 5) {
        this.logger.info('RULES: LAYER 2')
        const reqList: string[] = [
          'read',
          'write',
          'create',
          'update',
          'delete',
        ]
        const cleanRules = Object.keys(
          this.#rules['/databases/{database}/documents'][dbRule]
        ).filter((r: string) => !reqList.includes(r))
        const cleanReqPath = this.#request.path
          .split(`/${pathMatch.reqName}/${pathMatch.reqVar}`)
          .pop()
        for (let i = 0; i < cleanRules.length; i++) {
          const childRule = cleanRules[i]
          this.logger.info(`CHECKING CHILD RULE PATH: ${childRule}`)
          const childRuleMatch = this.parsePath(childRule, cleanReqPath)

          // CHILD (level 2)
          if (
            childRuleMatch.ruleName &&
            childRuleMatch.reqName &&
            childRuleMatch.ruleName === childRuleMatch.reqName
          ) {
            this.logger.info(`CHILD MATCH: ${childRuleMatch.ruleName}`)
            const rule: Rule =
              this.#rules['/databases/{database}/documents'][dbRule][childRule]
            this.logger.info(`RULE READ: ${rule.read}`)
            this.logger.info(`RULE CREATE: ${rule.create}`)
            this.logger.info(`RULE UDATE: ${rule.update}`)
            this.logger.info(`RULE DELETE: ${rule.delete}`)
            this.logger.info(`RULE WRITE: ${rule.write}`)

            // READ
            if (rule.read !== null && this.#request.method === 'GET') {
              this.logger.info('READ VALIDATION')
              // AUTH VALIDATION
              if (typeof rule.read === 'string') {
                await this.validateChildAuth(
                  this.#db,
                  rule.read,
                  pathMatch,
                  childRuleMatch,
                  this.#request as Request
                )
                this.logger.error(`RULES: READ SUCCESS`)
              }
              // NO VALIDATION
              if ((rule.read as boolean) === false) {
                this.logger.error(`NO VALIDATION: Invalid Permissions`)
                throw Error('Invalid Permissions')
              }
            } else if (
              rule.create !== undefined &&
              this.#request.method === 'POST'
            ) {
              if ((rule.create as boolean) === false) {
                this.logger.error(`RULES: CREATE Invalid Permissions`)
                throw Error('Invalid Permissions')
              }
              await this.validateChildAuth(
                this.#db,
                rule.create as string,
                pathMatch,
                childRuleMatch,
                this.#request as Request
              )
              this.logger.error(`RULES: CREATE SUCCESS`)
            } else if (
              rule.update !== undefined &&
              this.#request.method === 'PUT'
            ) {
              if ((rule.update as boolean) === false) {
                this.logger.error(`RULES: UPDATE Invalid Permissions`)
                throw Error('Invalid Permissions')
              }
              await this.validateChildAuth(
                this.#db,
                rule.update as string,
                pathMatch,
                childRuleMatch,
                this.#request as Request
              )
              this.logger.error(`RULES: UPDATE SUCCESS`)
            } else if (
              rule.delete !== undefined &&
              this.#request.method === 'DELETE'
            ) {
              if ((rule.delete as boolean) === false) {
                this.logger.error(`RULES: DELETE Invalid Permissions`)
                throw Error('Invalid Permissions')
              }
              await this.validateChildAuth(
                this.#db,
                rule.delete as string,
                pathMatch,
                childRuleMatch,
                this.#request as Request
              )
              this.logger.error(`RULES: DELETE SUCCESS`)
            } else if (
              rule.write !== null &&
              (this.#request.method === 'POST' ||
                this.#request.method === 'PUT' ||
                this.#request.method === 'DELETE')
            ) {
              this.logger.info('WRITE VALIDATION')
              // AUTH VALIDATION
              if (typeof rule.write === 'string') {
                await this.validateChildAuth(
                  this.#db,
                  rule.write,
                  pathMatch,
                  childRuleMatch,
                  this.#request as Request
                )
                this.logger.error(`RULES: WRITE SUCCESS`)
              }
              // NO VALIDATION
              if ((rule.write as boolean) === false) {
                this.logger.error(`RULES: WRITE Invalid Permissions`)
                throw Error('Invalid Permissions')
              }
            }
            this.logger.info(`${pathMatch} VALIDATED`)
            validated = true
          }
        }
        this.logger.info('RULES: CHILD FALL THROUGH')
        return
      }

      this.logger.info(`CHECKING PARENT RULE PATH: ${dbRule}`)
      if (Object.keys(pathMatch).length === 0 && dbRule === '/{document=**}') {
        if (validated) {
          this.logger.info('RULES: SKIP ROOT')
          return
        }
        const rule: Rule =
          this.#rules['/databases/{database}/documents'][dbRule]
        if (rule.read === true && this.#request.method === 'GET') {
          this.logger.info('RULES: ROOT DB GET')
          return
        } else if (rule.create === true && this.#request.method === 'POST') {
          this.logger.info('RULES: ROOT DB POST')
          return
        } else if (rule.update === true && this.#request.method === 'PUT') {
          this.logger.info('RULES: ROOT DB PUT')
          return
        } else if (rule.delete === true && this.#request.method === 'DELETE') {
          this.logger.info('RULES: ROOT DB DELETE')
          return
        } else if (
          rule.write === true &&
          (this.#request.method === 'POST' ||
            this.#request.method === 'PUT' ||
            this.#request.method === 'DELETE')
        ) {
          this.logger.info('RULES: ROOT WRITE')
          return
        } else {
          this.logger.info('RULES: ROOT Invalid Permissions')
          throw Error('Invalid Permissions')
        }
      }

      // PARENT (level 1)
      if (
        pathMatch.ruleName &&
        pathMatch.reqName &&
        pathMatch.ruleName === pathMatch.reqName
      ) {
        this.logger.info(`PARENT MATCH: ${pathMatch.ruleName}`)
        // const pathId = result[1]
        const rule: Rule =
          this.#rules['/databases/{database}/documents'][dbRule]
        // this.logger.info(`RULE READ: ${rule.read}`)
        // this.logger.info(`RULE CREATE: ${rule.create}`)
        // this.logger.info(`RULE UDATE: ${rule.update}`)
        // this.logger.info(`RULE DELETE: ${rule.delete}`)
        // this.logger.info(`RULE WRITE: ${rule.write}`)

        // READ
        if (rule.read !== null && this.#request.method === 'GET') {
          this.logger.info('READ VALIDATION')
          // AUTH VALIDATION
          if (typeof rule.read === 'string') {
            await this.validateAuth(
              this.#db,
              rule.read,
              pathMatch,
              this.#request as Request
            )
          }
          // NO VALIDATION
          if ((rule.read as boolean) === false) {
            throw Error('Invalid Permissions')
          }
        } else if (
          rule.create !== undefined &&
          this.#request.method === 'POST'
        ) {
          // this.logger.info('POST VALIDATION')
          if ((rule.create as boolean) === false) {
            throw Error('Invalid Permissions')
          }
          await this.validateAuth(
            this.#db,
            rule.create as string,
            pathMatch,
            this.#request as Request
          )
        } else if (
          rule.update !== undefined &&
          this.#request.method === 'PUT'
        ) {
          // this.logger.info('PUT VALIDATION')
          if ((rule.update as boolean) === false) {
            throw Error('Invalid Permissions')
          }
          await this.validateAuth(
            this.#db,
            rule.update as string,
            pathMatch,
            this.#request as Request
          )
        } else if (
          rule.delete !== undefined &&
          this.#request.method === 'DELETE'
        ) {
          // this.logger.info('DELETE VALIDATION')
          if ((rule.delete as boolean) === false) {
            throw Error('Invalid Permissions')
          }
          await this.validateAuth(
            this.#db,
            rule.delete as string,
            pathMatch,
            this.#request as Request
          )
        } else if (
          rule.write !== null &&
          (this.#request.method === 'POST' ||
            this.#request.method === 'PUT' ||
            this.#request.method === 'DELETE')
        ) {
          // this.logger.info('WRITE VALIDATION')
          // AUTH VALIDATION
          if (typeof rule.write === 'string') {
            await this.validateAuth(
              this.#db,
              rule.write,
              pathMatch,
              this.#request as Request
            )
          }
          // NO VALIDATION
          if ((rule.write as boolean) === false) {
            // this.logger.info('rule.write === false')
            throw Error('Invalid Permissions')
          }
        }
        // this.logger.info(`${pathMatch} VALIDATED`)
        validated = true
      }
      this.logger.info('RULES: PARENT FALL THROUGH')
    }
    // this.logger.info('END')
  }
}
