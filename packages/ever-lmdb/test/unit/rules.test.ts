import { deriveAddress, sign } from '@transia/ripple-keypairs'
import { UInt64, VarString } from '../../dist/npm/src/util/types'
// import { BaseModel, Metadata } from '../../dist/npm/src/models'
import { validateRequestAgainstRules } from '../../dist/npm/src/rules'

// const rules = `{
//   "rules_version": "1",
//   "service": "cloud.lmdb",
//   "/databases/{database}/documents": {
//     "/{document=**}": {
//       "read": false,
//       "write": false
//     },
//     "/MasterUserList/{userId}": {
//       "read": true,
//       "write": true
//     }
//   }
// }`;

// const rules = `{
//   "rules_version": "1",
//   "service": "cloud.lmdb",
//   "/databases/{database}/documents": {
//     "/MasterUserList/{userId}": {
//       "read": hasPermission("/Accounts/{accountId}", accountId),
//       "write": true
//     }
//   }
// }`;

// describe('rules', () => {
//   test('read success - read|true write|true', () => {
//     // const parsedData = JSON.parse(jsonData);
//     const request = {
//       database: "one",
//       method: "GET",
//       path: "/MasterUserList/1",
//       auth: {
//         uid: "2"
//       }
//     };
//     const rules = `{
//       "rules_version": "1",
//       "service": "cloud.lmdb",
//       "/databases/{database}/documents": {
//         "/MasterUserList/{userId}": {
//           "read": true,
//           "write": true
//         }
//       }
//     }`;
//     expect(validateRequestAgainstRules(request, rules)).toBe(true)
//   })
//   test('write success - read|true write|true', () => {
//     // const parsedData = JSON.parse(jsonData);
//     const request = {
//       database: "one",
//       method: "POST",
//       path: "/MasterUserList/1",
//       auth: {
//         uid: "2"
//       }
//     };
//     const rules = `{
//       "rules_version": "1",
//       "service": "cloud.lmdb",
//       "/databases/{database}/documents": {
//         "/MasterUserList/{userId}": {
//           "read": true,
//           "write": true
//         }
//       }
//     }`;
//     expect(validateRequestAgainstRules(request, rules)).toBe(true)
//   })
//   test('read failure - read|false write|false', () => {
//     // const parsedData = JSON.parse(jsonData);
//     const request = {
//       database: "one",
//       method: "POST",
//       path: "/MasterUserList/1",
//       auth: {
//         uid: "2"
//       }
//     };
//     const rules = `{
//       "rules_version": "1",
//       "service": "cloud.lmdb",
//       "/databases/{database}/documents": {
//         "/MasterUserList/{userId}": {
//           "read": false,
//           "write": false
//         }
//       }
//     }`;
//     expect(validateRequestAgainstRules(request, rules)).toBe(false)
//   })
//   test('write failure - read|false write|false', () => {
//     // const parsedData = JSON.parse(jsonData);
//     const request = {
//       database: "one",
//       method: "POST",
//       path: "/MasterUserList/1",
//       auth: {
//         uid: "2"
//       }
//     };
//     const rules = `{
//       "rules_version": "1",
//       "service": "cloud.lmdb",
//       "/databases/{database}/documents": {
//         "/MasterUserList/{userId}": {
//           "read": false,
//           "write": false
//         }
//       }
//     }`;
//     expect(validateRequestAgainstRules(request, rules)).toBe(false)
//   })
//   test('read success - read|auth write|auth', () => {
//     // const parsedData = JSON.parse(jsonData);
//     const request = {
//       database: "one",
//       method: "GET",
//       path: "/MasterUserList/1",
//       auth: {
//         uid: "1"
//       }
//     };
//     const rules = `{
//       "rules_version": "1",
//       "service": "cloud.lmdb",
//       "/databases/{database}/documents": {
//         "/MasterUserList/{userId}": {
//           "read": "request.auth.uid != null && request.auth.uid == userId",
//           "write": "request.auth.uid != null && request.auth.uid == userId"
//         }
//       }
//     }`;
//     expect(validateRequestAgainstRules(request, rules)).toBe(true)
//   })
//   test('write success - read|auth write|auth', () => {
//     // const parsedData = JSON.parse(jsonData);
//     const request = {
//       database: "one",
//       method: "GET",
//       path: "/MasterUserList/1",
//       auth: {
//         uid: "1"
//       }
//     };
//     const rules = `{
//       "rules_version": "1",
//       "service": "cloud.lmdb",
//       "/databases/{database}/documents": {
//         "/MasterUserList/{userId}": {
//           "read": "request.auth.uid != null && request.auth.uid == userId",
//           "write": "request.auth.uid != null && request.auth.uid == userId"
//         }
//       }
//     }`;
//     expect(validateRequestAgainstRules(request, rules)).toBe(true)
//   })
//   test('read failure - read|auth write|auth', () => {
//     // const parsedData = JSON.parse(jsonData);
//     const request = {
//       database: "one",
//       method: "GET",
//       path: "/MasterUserList/1",
//       auth: {
//         uid: "2"
//       }
//     };
//     const rules = `{
//       "rules_version": "1",
//       "service": "cloud.lmdb",
//       "/databases/{database}/documents": {
//         "/MasterUserList/{userId}": {
//           "read": "request.auth.uid != null && request.auth.uid == userId",
//           "write": "request.auth.uid != null && request.auth.uid == userId"
//         }
//       }
//     }`;
//     expect(validateRequestAgainstRules(request, rules)).toBe(false)
//   })
//   test('write failure - read|auth write|auth', () => {
//     // const parsedData = JSON.parse(jsonData);
//     const request = {
//       database: "one",
//       method: "GET",
//       path: "/MasterUserList/1",
//       auth: {
//         uid: "2"
//       }
//     };
//     const rules = `{
//       "rules_version": "1",
//       "service": "cloud.lmdb",
//       "/databases/{database}/documents": {
//         "/MasterUserList/{userId}": {
//           "read": "request.auth.uid != null && request.auth.uid == userId",
//           "write": "request.auth.uid != null && request.auth.uid == userId"
//         }
//       }
//     }`;
//     expect(validateRequestAgainstRules(request, rules)).toBe(false)
//   })
// })

// describe('rules xrpl binary', () => {
//   test('read xrpl success - read|auth write|auth', () => {
//     // const parsedData = JSON.parse(jsonData);
//     const path = '/MasterUserList/rLUEXYuLiQptky37CqLcm9USQpPiz5rkpD'
//     const publicKey = 'ED01FA53FA5A7E77798F882ECE20B1ABC00BB358A9E55A202D0D0676BD0CE37A63'
//     const privateKey = 'EDB4C4E046826BD26190D09715FC31F4E6A728204EADD112905B08B14B7F15C4F3'
//     const message = convertStringToHex(path)
//     const request = {
//       database: "one",
//       method: "GET",
//       path: path,
//       // data: {},
//       binary: message,
//       auth: {
//         type: 'xrpl',
//         uid: deriveAddress(publicKey),
//         signature: sign(message, privateKey),
//         pk: publicKey
//       }
//     };
//     const rules = `{
//       "rules_version": "1",
//       "service": "cloud.lmdb",
//       "/databases/{database}/documents": {
//         "/MasterUserList/{userId}": {
//           "read": "request.auth.uid != null && request.auth.uid == userId",
//           "write": "request.auth.uid != null && request.auth.uid == userId"
//         }
//       }
//     }`;
//     console.log(request);
//     console.log(rules);
//     expect(validateRequestAgainstRules(request, rules)).toBe(true)
//   })
//   test('read xrpl failure - read|auth write|auth', () => {
//     // const parsedData = JSON.parse(jsonData);
//     const path = '/MasterUserList/rLUEXYuLiQptky37CqLcm9USQpPiz5rkpD'
//     const badPublicKey = 'ED159E9BD047328760F85C0B17155735B90A15357FF4FE0148E1419A559045286F'
//     const privateKey = 'EDB4C4E046826BD26190D09715FC31F4E6A728204EADD112905B08B14B7F15C4F3'
//     const message = convertStringToHex(path)
//     const request = {
//       database: "one",
//       method: "GET",
//       path: path,
//       // data: {},
//       binary: message,
//       auth: {
//         type: 'xrpl',
//         uid: deriveAddress(badPublicKey),
//         signature: sign(message, privateKey),
//         pk: badPublicKey
//       }
//     };
//     const rules = `{
//       "rules_version": "1",
//       "service": "cloud.lmdb",
//       "/databases/{database}/documents": {
//         "/MasterUserList/{userId}": {
//           "read": "request.auth.uid != null && request.auth.uid == userId && request.auth.type == evernode",
//           "write": "request.auth.uid != null && request.auth.uid == userId && request.auth.type == evernode"
//         }
//       }
//     }`;
//     console.log(request);
//     console.log(rules);

//     expect(validateRequestAgainstRules(request, rules)).toBe(false)
//   })
// })

const SampleModel = class extends BaseModel {
  updatedTime: UInt64
  updatedBy: VarString
  message: VarString

  constructor(updatedTime: UInt64, updatedBy: VarString, message: VarString) {
    super()
    this.updatedTime = updatedTime
    this.updatedBy = updatedBy
    this.message = message
  }

  getMetadata(): Metadata {
    return [
      { field: 'updatedTime', type: 'uint64' },
      { field: 'updatedBy', type: 'varString', maxStringLength: 32 },
      { field: 'message', type: 'varString', maxStringLength: 250 },
    ]
  }

  toJSON() {
    return {
      updatedTime: this.updatedTime,
      updatedBy: this.updatedBy,
      message: this.message,
    }
  }
}

describe('rules khan xrpl binary', () => {
  test('write xrpl success - read|auth write|auth', () => {
    const model = new SampleModel(
      BigInt(1685216402734),
      'LWslHQUc7liAGYUryIhoRNPDbWucJZjj',
      'This is a message'
    )
    const path = '/MasterUserList/rLUEXYuLiQptky37CqLcm9USQpPiz5rkpD'
    const publicKey =
      'ED01FA53FA5A7E77798F882ECE20B1ABC00BB358A9E55A202D0D0676BD0CE37A63'
    const privateKey =
      'EDB4C4E046826BD26190D09715FC31F4E6A728204EADD112905B08B14B7F15C4F3'
    const request = {
      database: 'one',
      method: 'POST',
      path: path,
      // data: {},
      binary: model.encode(),
      auth: {
        type: 'xrpl',
        uid: deriveAddress(publicKey),
        signature: sign(model.encode(), privateKey),
        pk: publicKey,
      },
    }
    const rules = `{
      "rules_version": "1",
      "service": "cloud.lmdb",
      "/databases/{database}/documents": {
        "/MasterUserList/{userId}": {
          "read": "request.auth.uid != null && request.auth.uid == userId && request.auth.type == xrpl",
          "write": "request.auth.uid != null && request.auth.uid == userId && request.auth.type == xrpl"
        }
      }
    }`
    console.log(request)
    console.log(rules)
    expect(validateRequestAgainstRules(request, rules)).toBe(true)
  })
})
