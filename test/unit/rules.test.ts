// import { deriveAddress, sign } from 'ripple-keypairs'
// import { UInt64, VarString } from '../../dist/npm/src/util/types'
// import { BaseModel, Metadata } from '../../dist/npm/src/models'
import { validateRequestAgainstRules } from '../../dist/npm/src/rules'
import { Request, Rules } from '../../dist/npm/src/rules/types'
// import { MessageModel } from '../../dist/npm/src/models'

describe('rules - no permissions', () => {
  test('read failure - read|false write|false', () => {
    const request = {
      id: '1',
      type: 'type',
      database: 'one',
      method: 'GET',
      path: '/MasterUserList/1',
      auth: {
        uid: '1',
      },
    } as Request
    const rules = `{
      "rules_version": "1",
      "service": "cloud.lmdb",
      "/databases/{database}/documents": {
        "/{document=**}": {
          "read": false,
          "write": false
        }
      }
    }`
    const jsonRules = JSON.parse(rules) as Rules
    try {
      validateRequestAgainstRules(request, jsonRules)
    } catch (error: any) {
      expect(error.message).toBe('Invalid Permissions')
    }
  })
  test('write failure - read|false write|false', () => {
    const request = {
      id: '1',
      type: 'type',
      database: 'one',
      method: 'POST',
      path: '/MasterUserList/1',
      auth: {
        uid: '1',
      },
    } as Request
    const rules = `{
      "rules_version": "1",
      "service": "cloud.lmdb",
      "/databases/{database}/documents": {
        "/{document=**}": {
          "read": false,
          "write": false
        }
      }
    }`
    const jsonRules = JSON.parse(rules) as Rules
    try {
      validateRequestAgainstRules(request, jsonRules)
    } catch (error: any) {
      expect(error.message).toBe('Invalid Permissions')
    }
  })
})

describe('rules - read permissions', () => {
  test('read success - read|true write|false', () => {
    const request = {
      id: '1',
      type: 'type',
      database: 'one',
      method: 'GET',
      path: '/MasterUserList/1',
      auth: {
        uid: '1',
      },
    } as Request
    const rules = `{
      "rules_version": "1",
      "service": "cloud.lmdb",
      "/databases/{database}/documents": {
        "/{document=**}": {
          "read": true,
          "write": false
        }
      }
    }`
    const jsonRules = JSON.parse(rules) as Rules
    expect(validateRequestAgainstRules(request, jsonRules)).toBe(undefined)
  })
  test('write failure - read|true write|false', () => {
    const request = {
      id: '1',
      type: 'type',
      database: 'one',
      method: 'POST',
      path: '/MasterUserList/1',
      auth: {
        uid: '1',
      },
    } as Request
    const rules = `{
      "rules_version": "1",
      "service": "cloud.lmdb",
      "/databases/{database}/documents": {
        "/{document=**}": {
          "read": true,
          "write": false
        }
      }
    }`
    const jsonRules = JSON.parse(rules) as Rules
    try {
      validateRequestAgainstRules(request, jsonRules)
    } catch (error: any) {
      expect(error.message).toBe('Invalid Permissions')
    }
  })
})

describe('rules - read/write permissions', () => {
  test('read success - read|true write|true', () => {
    const request = {
      id: '1',
      type: 'type',
      database: 'one',
      method: 'GET',
      path: '/MasterUserList/1',
      auth: {
        uid: '1',
      },
    } as Request
    const rules = `{
      "rules_version": "1",
      "service": "cloud.lmdb",
      "/databases/{database}/documents": {
        "/{document=**}": {
          "read": true,
          "write": true
        }
      }
    }`
    const jsonRules = JSON.parse(rules) as Rules
    expect(validateRequestAgainstRules(request, jsonRules)).toBe(undefined)
  })
  test('write success - read|true write|false', () => {
    const request = {
      id: '1',
      type: 'type',
      database: 'one',
      method: 'POST',
      path: '/MasterUserList/1',
      auth: {
        uid: '1',
      },
    } as Request
    const rules = `{
      "rules_version": "1",
      "service": "cloud.lmdb",
      "/databases/{database}/documents": {
        "/{document=**}": {
          "read": true,
          "write": true
        }
      }
    }`
    const jsonRules = JSON.parse(rules) as Rules
    expect(validateRequestAgainstRules(request, jsonRules)).toBe(undefined)
  })
})

describe('rules - read/write collection permissions', () => {
  test('read collection failure - read|false write|false', () => {
    const request = {
      id: '1',
      type: 'type',
      database: 'one',
      method: 'GET',
      path: '/MasterUserList/1',
      auth: {
        uid: '1',
      },
    } as Request
    const rules = `{
      "rules_version": "1",
      "service": "cloud.lmdb",
      "/databases/{database}/documents": {
        "/MasterUserList/{userId}": {
          "read": false,
          "write": false
        },
        "/{document=**}": {
          "read": false,
          "write": false
        }
      }
    }`
    const jsonRules = JSON.parse(rules) as Rules
    try {
      validateRequestAgainstRules(request, jsonRules)
    } catch (error: any) {
      expect(error.message).toBe('Invalid Permissions')
    }
  })
  test('write collection failure - read|false write|false', () => {
    const request = {
      id: '1',
      type: 'type',
      database: 'one',
      method: 'POST',
      path: '/MasterUserList/1',
      auth: {
        uid: '1',
      },
    } as Request
    const rules = `{
      "rules_version": "1",
      "service": "cloud.lmdb",
      "/databases/{database}/documents": {
        "/MasterUserList/{userId}": {
          "read": false,
          "write": false
        },
        "/{document=**}": {
          "read": false,
          "write": false
        }
      }
    }`
    const jsonRules = JSON.parse(rules) as Rules
    try {
      validateRequestAgainstRules(request, jsonRules)
    } catch (error: any) {
      expect(error.message).toBe('Invalid Permissions')
    }
  })
  test('read collection success - read|true write|false', () => {
    const request = {
      id: '1',
      type: 'type',
      database: 'one',
      method: 'GET',
      path: '/MasterUserList/1',
      auth: {
        uid: '1',
      },
    } as Request
    const rules = `{
      "rules_version": "1",
      "service": "cloud.lmdb",
      "/databases/{database}/documents": {
        "/MasterUserList/{userId}": {
          "read": true,
          "write": false
        },
        "/{document=**}": {
          "read": false,
          "write": false
        }
      }
    }`
    const jsonRules = JSON.parse(rules) as Rules
    expect(validateRequestAgainstRules(request, jsonRules)).toBe(undefined)
  })
  test('write collection success - read|true write|true', () => {
    const request = {
      id: '1',
      type: 'type',
      database: 'one',
      method: 'POST',
      path: '/MasterUserList/1',
      auth: {
        uid: '1',
      },
    } as Request
    const rules = `{
      "rules_version": "1",
      "service": "cloud.lmdb",
      "/databases/{database}/documents": {
        "/MasterUserList/{userId}": {
          "read": true,
          "write": true
        },
        "/{document=**}": {
          "read": false,
          "write": false
        }
      }
    }`
    const jsonRules = JSON.parse(rules) as Rules
    expect(validateRequestAgainstRules(request, jsonRules)).toBe(undefined)
  })
  test('read outside collection failure - read|true write|false', () => {
    const request = {
      id: '1',
      type: 'type',
      database: 'one',
      method: 'GET',
      path: '/Protected/1',
      auth: {
        uid: '1',
      },
    } as Request
    const rules = `{
      "rules_version": "1",
      "service": "cloud.lmdb",
      "/databases/{database}/documents": {
        "/MasterUserList/{userId}": {
          "read": true,
          "write": true
        },
        "/{document=**}": {
          "read": false,
          "write": false
        }
      }
    }`
    const jsonRules = JSON.parse(rules) as Rules
    try {
      validateRequestAgainstRules(request, jsonRules)
      throw Error('invalid')
    } catch (error: any) {
      expect(error.message).toBe('Invalid Permissions')
    }
  })
  test('write outside collection failure - read|true write|true', () => {
    const request = {
      id: '1',
      type: 'type',
      database: 'one',
      method: 'POST',
      path: '/Protected/1',
      auth: {
        uid: '1',
      },
    } as Request
    const rules = `{
      "rules_version": "1",
      "service": "cloud.lmdb",
      "/databases/{database}/documents": {
        "/MasterUserList/{userId}": {
          "read": true,
          "write": true
        },
        "/{document=**}": {
          "read": false,
          "write": false
        }
      }
    }`
    const jsonRules = JSON.parse(rules) as Rules
    try {
      validateRequestAgainstRules(request, jsonRules)
      throw Error('invalid')
    } catch (error: any) {
      expect(error.message).toBe('Invalid Permissions')
    }
  })
})

// test('read success - read|auth write|auth', () => {
//   // const parsedData = JSON.parse(jsonData);
//   const request = {
//     database: "one",
//     method: "GET",
//     path: "/MasterUserList/1",
//     auth: {
//       uid: "1"
//     }
//   };
//   const rules = `{
//     "rules_version": "1",
//     "service": "cloud.lmdb",
//     "/databases/{database}/documents": {
//       "/MasterUserList/{userId}": {
//         "read": "request.auth.uid != null && request.auth.uid == userId",
//         "write": "request.auth.uid != null && request.auth.uid == userId"
//       }
//     }
//   }`;
//   expect(validateRequestAgainstRules(request, rules)).toBe(true)
// })
// test('write success - read|auth write|auth', () => {
//   // const parsedData = JSON.parse(jsonData);
//   const request = {
//     database: "one",
//     method: "GET",
//     path: "/MasterUserList/1",
//     auth: {
//       uid: "1"
//     }
//   };
//   const rules = `{
//     "rules_version": "1",
//     "service": "cloud.lmdb",
//     "/databases/{database}/documents": {
//       "/MasterUserList/{userId}": {
//         "read": "request.auth.uid != null && request.auth.uid == userId",
//         "write": "request.auth.uid != null && request.auth.uid == userId"
//       }
//     }
//   }`;
//   expect(validateRequestAgainstRules(request, rules)).toBe(true)
// })
// test('read failure - read|auth write|auth', () => {
//   // const parsedData = JSON.parse(jsonData);
//   const request = {
//     database: "one",
//     method: "GET",
//     path: "/MasterUserList/1",
//     auth: {
//       uid: "2"
//     }
//   };
//   const rules = `{
//     "rules_version": "1",
//     "service": "cloud.lmdb",
//     "/databases/{database}/documents": {
//       "/MasterUserList/{userId}": {
//         "read": "request.auth.uid != null && request.auth.uid == userId",
//         "write": "request.auth.uid != null && request.auth.uid == userId"
//       }
//     }
//   }`;
//   expect(validateRequestAgainstRules(request, rules)).toBe(false)
// })
// test('write failure - read|auth write|auth', () => {
//   // const parsedData = JSON.parse(jsonData);
//   const request = {
//     database: "one",
//     method: "GET",
//     path: "/MasterUserList/1",
//     auth: {
//       uid: "2"
//     }
//   };
//   const rules = `{
//     "rules_version": "1",
//     "service": "cloud.lmdb",
//     "/databases/{database}/documents": {
//       "/MasterUserList/{userId}": {
//         "read": "request.auth.uid != null && request.auth.uid == userId",
//         "write": "request.auth.uid != null && request.auth.uid == userId"
//       }
//     }
//   }`;
//   expect(validateRequestAgainstRules(request, rules)).toBe(false)
// })
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

// const SampleModel = class extends BaseModel {
//   updatedTime: UInt64
//   updatedBy: VarString
//   message: VarString

//   constructor(updatedTime: UInt64, updatedBy: VarString, message: VarString) {
//     super()
//     this.updatedTime = updatedTime
//     this.updatedBy = updatedBy
//     this.message = message
//   }

//   getMetadata(): Metadata {
//     return [
//       { field: 'updatedTime', type: 'uint64' },
//       { field: 'updatedBy', type: 'varString', maxStringLength: 32 },
//       { field: 'message', type: 'varString', maxStringLength: 250 },
//     ]
//   }

//   toJSON() {
//     return {
//       updatedTime: this.updatedTime,
//       updatedBy: this.updatedBy,
//       message: this.message,
//     }
//   }
// }

// describe('rules khan xrpl binary', () => {
//   test('write xrpl success - read|auth write|auth', () => {
//     const model = new MessageModel(
//       BigInt(1685216402734),
//       'LWslHQUc7liAGYUryIhoRNPDbWucJZjj',
//       'This is a message'
//     )
//     const path = '/MasterUserList/rLUEXYuLiQptky37CqLcm9USQpPiz5rkpD'
//     const publicKey =
//       'ED01FA53FA5A7E77798F882ECE20B1ABC00BB358A9E55A202D0D0676BD0CE37A63'
//     const privateKey =
//       'EDB4C4E046826BD26190D09715FC31F4E6A728204EADD112905B08B14B7F15C4F3'
//     const request = {
//       id: '1',
//       type: '1',
//       database: 'one',
//       method: 'POST',
//       path: path,
//       // data: {},
//       binary: model.encode(),
//       auth: {
//         uid: deriveAddress(publicKey),
//         signature: sign(model.encode(), privateKey),
//         pk: publicKey,
//       },
//     }
//     const rules = `{
//       "rules_version": "1",
//       "service": "cloud.lmdb",
//       "/databases/{database}/documents": {
//         "/MasterUserList/{userId}": {
//           "read": "request.auth.uid != null && request.auth.uid == userId && request.auth.type == xrpl",
//           "write": "request.auth.uid != null && request.auth.uid == userId && request.auth.type == xrpl"
//         }
//       }
//     }`
//     console.log(request)
//     console.log(rules)
//     expect(validateRequestAgainstRules(request, rules)).toBe(true)
//   })
// })
