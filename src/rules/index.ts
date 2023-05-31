import { deriveAddress } from 'xrpl'
import { Auth, Request, Rule, Rules } from './types'
import { verify } from 'ripple-keypairs/dist'

// const getId = (string: string) => {
//   const regex = /{([^}]+)}/;
//   const matches = regex.exec(string);
//   if (matches) {
//     return matches[1]
//   } else {
//     return null
//   }
// }

export function validateXrplAuth(
  binary: string,
  signature: string,
  pk: string,
  uid: string
): void {
  if (!binary || !signature || !pk) {
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

function validateAuth(
  str: string,
  ruleId: string,
  reqId: string,
  req: Request
): void {
  // console.log('AUTH RULE TRIGGERED')
  // console.log(str)
  // console.log(pathId)
  // console.log(req)
  const auth = req.auth as Auth
  // console.log(auth.uid)
  // console.log(auth.signature)
  // console.log(auth.pk)

  // const arr = str.split(' ')

  if (str.includes('request.auth.uid') && str.includes('!= null')) {
    // console.log('request.auth.uid != null')
    if (auth.uid === null) {
      throw Error('Invalid Permissions: Auth must not be null')
    }
  }
  if (str.includes('request.auth.uid') && str.includes(`== ${ruleId}`)) {
    // console.log(`request.auth.uid == ${ruleId}`)
    // console.log(`AUTH ID: ${auth.uid}`)
    // console.log(`REQ ID: ${reqId}`)
    if (auth.uid !== reqId) {
      throw Error('Invalid Permissions: Invalid Id')
    }
  }
  if (str.includes('request.auth.type') && str.includes('== xrpl')) {
    // console.log('request.auth.type == "xrpl"')
    if (!auth.signature || !auth.pk) {
      throw Error('Invalid Xrpl Signature Parameters')
    }
    validateXrplAuth(
      req.binary as string,
      auth.signature as string,
      auth.pk as string,
      auth.uid as string
    )
  }
  // console.log('AUTH VALIDATED')
  return
}

interface PathMatch {
  parentRuleName: string
  parentReqName: string
  parentRuleVar: string
  parentReqVar: string
  childName?: string | undefined
  childVarName?: string | undefined
  childVar?: string | undefined
}

export function parsePath(path: string, reqPath: string) {
  const pattern =
    /^\/([A-Za-z0-9]+)\/\{([A-Za-z0-9]+)\}\/?([A-Za-z0-9]+)?\/?\{?([A-Za-z0-9]+)?\}?/
  const pathMatch = path.match(pattern)
  if (pathMatch) {
    if (!pathMatch[1] || !pathMatch[2]) {
      console.log('invalid collection / document index')
      return {} as PathMatch
    }
    const reqPattern =
      /^\/([A-Za-z0-9]+)\/([A-Za-z0-9]+)\/?([A-Za-z0-9]+)?\/?([A-Za-z0-9]+)?/
    const reqMatch = reqPath.match(reqPattern)

    // if (pathMatch[1] !== reqMatch[1]) {
    //   throw Error('bad match collection / document index')
    // }

    if (reqMatch && pathMatch[3] === undefined && pathMatch[4] === undefined) {
      return {
        parentRuleName: pathMatch[1],
        parentReqName: reqMatch[1],
        parentRuleVar: pathMatch[2],
        parentReqVar: reqMatch[2],
      } as PathMatch
    }
    // return {
    //   parentName: pathMatch[1],
    //   parentVarName: pathMatch[2],
    //   parentVar: reqMatch[2],
    //   childName: pathMatch[3],
    //   childVarName: pathMatch[4],
    //   childVar: reqMatch[4],
    // } as PathMatch
  }
  return {} as PathMatch
}

export function validateRequestAgainstRules(req: Request, rules: Rules): void {
  const pathParams: string[] = Object.keys(
    rules['/databases/{database}/documents']
  )
  let validated = false
  for (let i = 0; i < pathParams.length; i++) {
    const pathParam = pathParams[i]
    // console.log(`CHECKING RULE PATH: ${pathParam}`)
    // console.log(`CHECKING REQ PATH: ${req.path}`)
    const pathMatch = parsePath(pathParam, req.path)
    if (Object.keys(pathMatch).length === 0 && pathParam === '/{document=**}') {
      // console.log('ROOT DB VALIDATION')
      if (validated) {
        // console.log('SKIPPING ROOT DB VALIDATION')
        return
      }
      const rule: Rule = rules['/databases/{database}/documents'][pathParam]
      if (rule.read === true && req.method === 'GET') {
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

    if (pathMatch.parentRuleName === pathMatch.parentReqName) {
      // console.log(`MATCH: ${pathMatch.parentRuleName}`)
      // const pathId = result[1]
      const rule: Rule = rules['/databases/{database}/documents'][pathParam]
      // READ
      if (rule.read !== null && req.method === 'GET') {
        // console.log('READ VALIDATION')
        // AUTH VALIDATION
        if (typeof rule.read === 'string') {
          if (rule.read.includes('request.auth.uid')) {
            validateAuth(
              rule.read,
              pathMatch.parentRuleVar,
              pathMatch.parentReqVar,
              req as Request
            )
          }
        }
        // NO VALIDATION
        if ((rule.read as boolean) === false) {
          throw Error('Invalid Permissions')
        }

        // WRITE
      } else if (
        rule.write !== null &&
        (req.method === 'POST' ||
          req.method === 'PUT' ||
          req.method === 'DELETE')
      ) {
        // console.log('WRITE VALIDATION')
        // AUTH VALIDATION
        if (typeof rule.write === 'string') {
          if (rule.write.includes('request.auth.uid')) {
            validateAuth(
              rule.write,
              pathMatch.parentRuleVar,
              pathMatch.parentReqVar,
              req as Request
            )
          }
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
    // console.log('VALIDATION BY POE')
  }
}
