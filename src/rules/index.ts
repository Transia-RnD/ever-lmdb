import { convertStringToHex, deriveAddress } from '@transia/xrpl'
import { Auth, Request, Rule, Rules } from './types'
import { verify } from '@transia/ripple-keypairs/dist'
import { LMDBDatabase } from '../libs'
import {
  Metadata,
  decodeMetadata,
} from '@transia/hooks-toolkit/dist/npm/src/libs/binary-models'

// const getId = (string: string) => {
//   const regex = /{([^}]+)}/;
//   const matches = regex.exec(string);
//   if (matches) {
//     return matches[1]
//   } else {
//     return null
//   }
// }

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

// interface FunctionPathMatch {
//   ruleName: string
//   reqName: string
//   ruleVar: string
//   reqVar: string
//   childName?: string | undefined
//   childVarName?: string | undefined
//   childVar?: string | undefined
// }

// export function parseFunction(path: string) {
//   const pattern =
//     /^get\(\/databases\/([a-zA-Z]+)\/documents\/([a-zA-Z]+)\/{request.resource.data.([a-zA-Z0-9]+)}\/([a-zA-Z]+)\)\.([A-Za-z]+\b)$/
//   const functionMatch = path.match(pattern)
//   console.log(`FUNCTION MATCH: ${functionMatch}`)
//   if (functionMatch) {
//     console.log('MATCHED FUNCTION')
//   }
//   console.log('NO MATCHED FUNCTION')
//   return {} as PathMatch
// }
export function parseFunction(path: string) {
  const pattern =
    /(\!?get|\!?exists|\!?getAfter)?\((.*)\).([a-zA-Z]+.[a-zA-Z]+)/
  const functionMatch = path.match(pattern)
  // console.log(`FULL PATH: ${path}`)
  // console.log(`FUNCTION MATCH: ${functionMatch}`)
  if (functionMatch && functionMatch[0] && functionMatch[1]) {
    // console.log('MATCHED FUNCTION')
    return {
      function: functionMatch[1],
      path: functionMatch[2],
      var: functionMatch[3],
    } as FunctionMatch
  }
  // console.log('NO MATCHED FUNCTION')
  return {} as FunctionMatch
}

export function parseGetData(path: string) {
  const pattern =
    /\.data\.([a-zA-Z]+)\s==\s(.*)\s\&\&|\.data.(([a-zA-Z]+)[\.](includes)\(\{([a-zA-Z]+)\}\,\s\{([a-zA-Z.]+)\}\))/
  const dataMatch = path.match(pattern)
  if (dataMatch && dataMatch.length == 8) {
    // console.log(`MATCHED: ${dataMatch[5]}`)
    return {
      function: dataMatch[5],
      type: 'map',
      var: dataMatch[4],
      mapVar: dataMatch[6],
      compare: dataMatch[7],
    } as DataMatch
  }
  if (dataMatch && dataMatch[1]) {
    // console.log('MATCHED: COMPARE')
    return {
      var: dataMatch[1],
      compare: dataMatch[2],
    } as DataMatch
  }
  // console.log('NO MATCHED DATA')
  return {} as DataMatch
}

export function parseData(path: string) {
  const pattern = /request\.resource\.data\.([a-zA-Z]+)\s==\s(.*)\s?\&?\&?/
  const dataMatch = path.match(pattern)
  // console.log(`FULL PATH: ${path}`)
  // console.log(`DATA MATCH: ${dataMatch}`)
  if (dataMatch && dataMatch[1]) {
    // console.log('MATCHED DATA')
    return {
      var: dataMatch[1],
      compare: dataMatch[2],
    } as DataMatch
  }
  // console.log('NO MATCHED DATA')
  return {} as DataMatch
}

export async function validateFunction(
  req: Request,
  db: LMDBDatabase,
  rullPath: string,
  reqPath: string
): Promise<boolean> {
  // console.log(`FUNC VALIDATE: ${rullPath}`)
  const funcMatch = parseFunction(rullPath)
  if (funcMatch.function === 'exists' || funcMatch.function === '!exists') {
    // console.log('EXISTS FUNCTION VALIDATION')
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
    // console.log('GET FUNCTION VALIDATION')
    try {
      const response = await db.get(convertStringToHex(reqPath))
      const data = JSON.parse(response)
      const decoded = decodeMetadata(data.binary, data.metadata as Metadata)
      const dataMatch = parseGetData(rullPath)
      if (dataMatch.function === 'includes') {
        const variable: any[] = decoded[dataMatch.var as string]
        const compareValue =
          dataMatch.compare === 'request.auth.uid'
            ? req.auth.uid
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
            ? req.auth.uid
            : dataMatch.compare)
        ) {
          // console.log('GET DATA MATCH RULE')
          return true
        }
      }
    } catch (error: any) {
      console.log(error)
      return false
    }
  }
  return true
}

export function validateXrplAuth(
  binary: string,
  signature: string,
  pk: string,
  uid: string
): void {
  if (!binary || !signature || !pk) {
    // console.log('INVALID BINARY | SIG | PK')
    throw Error('Invalid Xrpl Validation')
  }
  // console.log('VALIDATE XRPL DATA')
  if (verify(binary, signature, pk) && deriveAddress(pk) === uid) {
    // console.log('XRPL DATA VALIDATED')
    return
  }
  // console.log('XRPL DATA NOT VALIDATED')
  throw Error('Invalid Xrpl Validation')
}

async function validateAuth(
  db: LMDBDatabase,
  str: string,
  pathMatch: PathMatch,
  req: Request
): Promise<void> {
  // console.log(`PARENT RULE TRIGGERED: ${str}`)
  const auth = req.auth as Auth
  if (
    str.includes('request.auth.uid') &&
    str.includes('request.auth.uid != null')
  ) {
    // console.log('request.auth.uid != null')
    if (auth.uid === null) {
      throw Error('Invalid Permissions: Auth must not be null')
    }
  }
  if (
    str.includes('request.auth.uid') &&
    str.includes(`request.auth.uid == ${pathMatch.ruleVar}`)
  ) {
    // console.log(`request.auth.uid == ${ruleId}`)
    if (auth.uid !== pathMatch.reqVar) {
      throw Error('Invalid Permissions: Invalid Id')
    }
  }

  if (!auth.signature || !auth.pk) {
    throw Error('Invalid Xrpl Signature Parameters')
  }
  validateXrplAuth(
    req.binary as string,
    auth.signature as string,
    auth.pk as string,
    auth.uid as string
  )
  const reqPath = `/${pathMatch.reqName}/${pathMatch.reqVar}`
  if (!(await validateFunction(req, db, str, reqPath))) {
    throw Error('Invalid Permissions')
  }
  // console.log('PARENT AUTH VALIDATED')
  return
}

async function validateChildAuth(
  db: LMDBDatabase,
  str: string,
  parentMatch: PathMatch,
  childMatch: PathMatch,
  req: Request
): Promise<void> {
  // console.log(`CHILD RULE TRIGGERED: ${str}`)
  const auth = req.auth as Auth
  if (
    str.includes('request.auth.uid') &&
    str.includes('request.auth.uid != null')
  ) {
    if (auth.uid === null) {
      throw Error('Invalid Permissions: Auth must not be null')
    }
  }
  if (
    str.includes('request.auth.uid') &&
    str.includes(`request.auth.uid == ${childMatch.ruleVar}`)
  ) {
    if (auth.uid !== childMatch.reqVar) {
      throw Error('Invalid Permissions: Invalid Id')
    }
  }
  if (!auth.signature || !auth.pk) {
    throw Error('Invalid Xrpl Signature Parameters')
  }
  validateXrplAuth(
    req.binary as string,
    auth.signature as string,
    auth.pk as string,
    auth.uid as string
  )
  const parentPath = `/${parentMatch.reqName}/${parentMatch.reqVar}`
  // const reqPath = parentPath + `/${childMatch.reqName}/${childMatch.reqVar}`
  if (!(await validateFunction(req, db, str, parentPath))) {
    throw Error('Invalid Permissions')
  }
  // console.log('CHILD AUTH VALIDATED')
  return
}

interface PathMatch {
  ruleName: string
  reqName: string
  ruleVar: string
  reqVar: string
}

export function parsePath(path: string, reqPath: string) {
  // console.log(`RULE PATH: ${path}`)
  // console.log(`REQ PATH: ${reqPath}`)
  const pattern =
    /^\/([A-Za-z0-9]+)\/\{([A-Za-z0-9]+)\}\/?([A-Za-z0-9]+)?\/?\{?([A-Za-z0-9]+)?\}?/
  const pathMatch = path.match(pattern)
  // console.log(`RULE PATH MATCH: ${pathMatch}`)
  if (pathMatch) {
    if (!pathMatch[1] || !pathMatch[2]) {
      // console.log('invalid collection / document index')
      return {} as PathMatch
    }
    const reqPattern =
      /^\/([A-Za-z0-9]+)\/([A-Za-z0-9]+)\/?([A-Za-z0-9]+)?\/?([A-Za-z0-9]+)?/
    const reqMatch = reqPath.match(reqPattern)
    return {
      ruleName: pathMatch[1],
      reqName: reqMatch[1],
      ruleVar: pathMatch[2],
      reqVar: reqMatch[2],
    } as PathMatch
  }
  return {} as PathMatch
}

export async function validateRequestAgainstRules(
  req: Request,
  rules: Rules,
  db?: LMDBDatabase | null
): Promise<void> {
  const dbRules: string[] = Object.keys(
    rules['/databases/{database}/documents']
  )
  let validated = false
  // Layer 1
  for (let i = 0; i < dbRules.length; i++) {
    const dbRule = dbRules[i]
    const pathMatch = parsePath(dbRule, req.path)

    // LAYER 2
    if (req.path.split('/').length === 5) {
      // console.log(`LAYER 2`)
      const reqList: string[] = ['read', 'write', 'create', 'update', 'delete']
      const cleanRules = Object.keys(
        rules['/databases/{database}/documents'][dbRule]
      ).filter((r: string) => !reqList.includes(r))
      const cleanReqPath = req.path
        .split(`/${pathMatch.reqName}/${pathMatch.reqVar}`)
        .pop()
      for (let i = 0; i < cleanRules.length; i++) {
        const childRule = cleanRules[i]
        // console.log(`CHECKING CHILD RULE PATH: ${childRule}`)
        const childRuleMatch = parsePath(childRule, cleanReqPath)

        // CHILD (level 2)
        if (
          childRuleMatch.ruleName &&
          childRuleMatch.reqName &&
          childRuleMatch.ruleName === childRuleMatch.reqName
        ) {
          // console.log(`CHILD MATCH: ${childRuleMatch.ruleName}`)
          const rule: Rule =
            rules['/databases/{database}/documents'][dbRule][childRule]
          // console.log(`RULE READ: ${rule.read}`)
          // console.log(`RULE CREATE: ${rule.create}`)
          // console.log(`RULE UDATE: ${rule.update}`)
          // console.log(`RULE DELETE: ${rule.delete}`)
          // console.log(`RULE WRITE: ${rule.write}`)

          // READ
          if (rule.read !== null && req.method === 'GET') {
            // console.log('READ VALIDATION')
            // AUTH VALIDATION
            if (typeof rule.read === 'string') {
              await validateChildAuth(
                db,
                rule.read,
                pathMatch,
                childRuleMatch,
                req as Request
              )
            }
            // NO VALIDATION
            if ((rule.read as boolean) === false) {
              throw Error('Invalid Permissions')
            }
          } else if (rule.create !== undefined && req.method === 'POST') {
            if ((rule.create as boolean) === false) {
              throw Error('Invalid Permissions')
            }
            await validateChildAuth(
              db,
              rule.create as string,
              pathMatch,
              childRuleMatch,
              req as Request
            )
          } else if (rule.update !== undefined && req.method === 'PUT') {
            if ((rule.update as boolean) === false) {
              throw Error('Invalid Permissions')
            }
            await validateChildAuth(
              db,
              rule.update as string,
              pathMatch,
              childRuleMatch,
              req as Request
            )
          } else if (rule.delete !== undefined && req.method === 'DELETE') {
            if ((rule.delete as boolean) === false) {
              throw Error('Invalid Permissions')
            }
            await validateChildAuth(
              db,
              rule.delete as string,
              pathMatch,
              childRuleMatch,
              req as Request
            )
          } else if (
            rule.write !== null &&
            (req.method === 'POST' ||
              req.method === 'PUT' ||
              req.method === 'DELETE')
          ) {
            // console.log('WRITE VALIDATION')
            // AUTH VALIDATION
            if (typeof rule.write === 'string') {
              await validateChildAuth(
                db,
                rule.write,
                pathMatch,
                childRuleMatch,
                req as Request
              )
            }
            // NO VALIDATION
            if ((rule.write as boolean) === false) {
              // console.log('rule.write === false')
              throw Error('Invalid Permissions')
            }
          }
          // console.log(`${pathMatch} VALIDATED`)
          validated = true
        }
      }
      // console.log('CHILD VALIDATION SUCCESSFUL')
      return
    }

    // console.log(`CHECKING PARENT RULE PATH: ${dbRule}`)
    if (Object.keys(pathMatch).length === 0 && dbRule === '/{document=**}') {
      if (validated) {
        // console.log('SKIPPING ROOT DB VALIDATION')
        return
      }
      const rule: Rule = rules['/databases/{database}/documents'][dbRule]
      if (rule.read === true && req.method === 'GET') {
        return
      } else if (rule.create === true && req.method === 'POST') {
        return
      } else if (rule.update === true && req.method === 'PUT') {
        return
      } else if (rule.delete === true && req.method === 'DELETE') {
        return
      } else if (
        rule.write === true &&
        (req.method === 'POST' ||
          req.method === 'PUT' ||
          req.method === 'DELETE')
      ) {
        return
      } else {
        throw Error('Invalid Permissions')
      }
    }

    // PARENT (level 1)
    if (
      pathMatch.ruleName &&
      pathMatch.reqName &&
      pathMatch.ruleName === pathMatch.reqName
    ) {
      // console.log(`PARENT MATCH: ${pathMatch.ruleName}`)
      // const pathId = result[1]
      const rule: Rule = rules['/databases/{database}/documents'][dbRule]
      // console.log(`RULE READ: ${rule.read}`)
      // console.log(`RULE CREATE: ${rule.create}`)
      // console.log(`RULE UDATE: ${rule.update}`)
      // console.log(`RULE DELETE: ${rule.delete}`)
      // console.log(`RULE WRITE: ${rule.write}`)

      // READ
      if (rule.read !== null && req.method === 'GET') {
        // console.log('READ VALIDATION')
        // AUTH VALIDATION
        if (typeof rule.read === 'string') {
          await validateAuth(db, rule.read, pathMatch, req as Request)
        }
        // NO VALIDATION
        if ((rule.read as boolean) === false) {
          throw Error('Invalid Permissions')
        }
      } else if (rule.create !== undefined && req.method === 'POST') {
        // console.log('POST VALIDATION')
        if ((rule.create as boolean) === false) {
          throw Error('Invalid Permissions')
        }
        await validateAuth(db, rule.create as string, pathMatch, req as Request)
      } else if (rule.update !== undefined && req.method === 'PUT') {
        // console.log('PUT VALIDATION')
        if ((rule.update as boolean) === false) {
          throw Error('Invalid Permissions')
        }
        await validateAuth(db, rule.update as string, pathMatch, req as Request)
      } else if (rule.delete !== undefined && req.method === 'DELETE') {
        // console.log('DELETE VALIDATION')
        if ((rule.delete as boolean) === false) {
          throw Error('Invalid Permissions')
        }
        await validateAuth(db, rule.delete as string, pathMatch, req as Request)
      } else if (
        rule.write !== null &&
        (req.method === 'POST' ||
          req.method === 'PUT' ||
          req.method === 'DELETE')
      ) {
        // console.log('WRITE VALIDATION')
        // AUTH VALIDATION
        if (typeof rule.write === 'string') {
          await validateAuth(db, rule.write, pathMatch, req as Request)
        }
        // NO VALIDATION
        if ((rule.write as boolean) === false) {
          // console.log('rule.write === false')
          throw Error('Invalid Permissions')
        }
      }
      // console.log(`${pathMatch} VALIDATED`)
      validated = true
    }
    // console.log('PARENT VALIDATION SUCCESSFUL')
  }
  // console.log('END')
}
