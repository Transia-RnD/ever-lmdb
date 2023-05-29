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

function validateXrplAuth(data: string, auth: Auth): void {
  console.log('VALIDATE XRPL REQUEST')
  // console.log(data);
  // console.log(auth);
  // console.log(verify(data, auth.signature, auth.pk));
  if (
    verify(data, auth.signature, auth.pk) &&
    deriveAddress(auth.pk) === auth.uid
  ) {
    console.log('XRPL REQUEST SUCCESS')
    return
  }
  console.log('XRPL REQUEST FAILED')
  throw Error('Invalid Request Signature')
}

// const hasPermission = (path, id) => {
//   // get db entry
// }

function validateAuth(str: string, pathId: string, req: Request): void {
  console.log('AUTH RULE TRIGGERED')
  // console.log(str)
  // console.log(pathId)
  // console.log(req)
  const auth = req.auth as Auth
  // console.log(auth.uid)
  // console.log(auth.signature)
  // console.log(auth.pk)

  const arr = str.split(' ')
  if (arr[0] === 'request.auth.uid' && arr[1] === '!=' && arr[2] === 'null') {
    console.log('request.auth.uid != null')
    // console.log(auth.uid === null)
    if (auth.uid === null) {
      throw Error('Invalid Permissions: Auth must not be null')
    }
  }
  if (arr[0] === 'request.auth.uid' && arr[1] === '==' && arr[2] === 'null') {
    console.log('request.auth.uid == null')
    // console.log(auth.uid !== null)
    if (auth.uid !== null) {
      throw Error('Invalid Permissions: Auth must be null')
    }
  }
  if (arr[4] === 'request.auth.uid' && arr[5] === '!=' && arr[6] === 'userId') {
    console.log('request.auth.uid != uid')
    // console.log(auth.uid === pathId)
    if (auth.uid === pathId) {
      throw Error('Invalid Permissionsr: Invalid Id')
    }
  }
  if (arr[4] === 'request.auth.uid' && arr[5] === '==' && arr[6] === 'userId') {
    console.log('request.auth.uid == uid')
    // console.log(auth.uid !== pathId)
    if (auth.uid !== pathId) {
      throw Error('Invalid Permissions: Invalid Id')
    }
  }
  if (arr[8] === 'request.auth.type' && arr[9] === '==' && arr[10] === 'xrpl') {
    console.log('request.auth.type == "xrpl"')
    // console.log(auth.type !== 'xrpl')
    if (!auth.signature || !auth.pk) {
      throw Error('Invalid Request Parameters')
    }
    validateXrplAuth(req.binary as string, auth)
  }
  console.log('AUTH VALIDATED')
  return
}

export function validateRequestAgainstRules(req: Request, rules: Rules): void {
  const pathParams: string[] = Object.keys(
    rules['/databases/{database}/documents']
  )
  let validated = false
  for (let i = 0; i < pathParams.length; i++) {
    const pathParam = pathParams[i]
    console.log(`CHECKING RULE PATH: ${pathParam}`)
    console.log(`CHECKING REQ PATH: ${req.path}`)
    const ruleParamRegex = pathParam.replace(/\{.*\}/, '([A-Za-z0-9]{1,64})')
    const result = req.path.match(ruleParamRegex)
    if (result) {
      if (pathParam !== '/{document=**}') {
        console.log(`MATCH: ${result}`)
        const pathId = result[1]
        const rule: Rule = rules['/databases/{database}/documents'][pathParam]

        // READ
        if (rule.read !== null && req.method === 'GET') {
          console.log('READ VALIDATION')
          // AUTH VALIDATION
          if (typeof rule.read === 'string') {
            if (rule.read.includes('request.auth.uid')) {
              validateAuth(rule.read, pathId, req as Request)
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
          console.log('WRITE VALIDATION')
          // AUTH VALIDATION
          if (typeof rule.write === 'string') {
            if (rule.write.includes('request.auth.uid')) {
              validateAuth(rule.write, pathId, req as Request)
            }
          }
          // NO VALIDATION
          if ((rule.write as boolean) === false) {
            console.log('rule.write === false')
            throw Error('Invalid Permissions')
          }
        }
        console.log(`${result} VALIDATED`)
        validated = true
      }
    }
    if (!validated && pathParam === '/{document=**}') {
      console.log('ROOT DB VALIDATION')
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
    console.log('VALIDATION BY POE')
  }
}
