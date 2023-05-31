import { validateRequestAgainstRules } from '../../dist/npm/src/rules'
import { Request, Rules } from '../../dist/npm/src/rules/types'
import { MessageModel } from '../../dist/npm/src/models'
import { convertHexToString } from 'xrpl'
import { prepareRequest } from '../../dist/npm/src/services/api'
import { EvernodeTestContext, setupClient } from '../integration/util'

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

describe('rules - read | auth.uid', () => {
  test('read|auth.uid write|auth.uid global|read|false global|write|false', () => {
    const request = {
      id: '1',
      type: 'type',
      database: 'one',
      method: 'GET',
      path: '/SomeUser/1',
      auth: {
        uid: '1',
      },
    } as Request
    const rules = `{
      "rules_version": "1",
      "service": "cloud.lmdb",
      "/databases/{database}/documents": {
        "/MasterUserList/{userId}": {
          "read": "request.auth.uid != null && request.auth.uid == userId",
          "write": "request.auth.uid != null && request.auth.uid == userId"
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
  test('read|auth.uid write|auth.uid global|read|true global|write|false', () => {
    const request = {
      id: '1',
      type: 'type',
      database: 'one',
      method: 'GET',
      path: '/SomeUser/1',
      auth: {
        uid: '1',
      },
    } as Request
    const rules = `{
      "rules_version": "1",
      "service": "cloud.lmdb",
      "/databases/{database}/documents": {
        "/MasterUserList/{userId}": {
          "read": "request.auth.uid != null && request.auth.uid == userId",
          "write": "request.auth.uid != null && request.auth.uid == userId"
        },
        "/{document=**}": {
          "read": true,
          "write": false
        }
      }
    }`
    const jsonRules = JSON.parse(rules) as Rules
    expect(validateRequestAgainstRules(request, jsonRules)).toBe(undefined)
  })
  test('read|auth.uid write|auth.uid global|read|false global|write|false', () => {
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
          "read": "request.auth.uid != null && request.auth.uid == userId",
          "write": "request.auth.uid != null && request.auth.uid == userId"
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
  test('read|auth.uid write|auth.uid global|read|false global|write|false', () => {
    const request = {
      id: '1',
      type: 'type',
      database: 'one',
      method: 'GET',
      path: '/MasterUserList/1',
      auth: {
        uid: '2',
      },
    } as Request
    const rules = `{
      "rules_version": "1",
      "service": "cloud.lmdb",
      "/databases/{database}/documents": {
        "/MasterUserList/{userId}": {
          "read": "request.auth.uid != null && request.auth.uid == userId",
          "write": "request.auth.uid != null && request.auth.uid == userId"
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
      expect(error.message).toBe('Invalid Permissions: Invalid Id')
    }
  })
})

describe('rules - write | auth.uid', () => {
  test('read|auth.uid write|auth.uid global|read|false global|write|false', () => {
    const request = {
      id: '1',
      type: 'type',
      database: 'one',
      method: 'POST',
      path: '/SomeUser/1',
      auth: {
        uid: '1',
      },
    } as Request
    const rules = `{
      "rules_version": "1",
      "service": "cloud.lmdb",
      "/databases/{database}/documents": {
        "/MasterUserList/{userId}": {
          "read": "request.auth.uid != null && request.auth.uid == userId",
          "write": "request.auth.uid != null && request.auth.uid == userId"
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
  test('read|auth.uid write|auth.uid global|read|true global|write|false', () => {
    const request = {
      id: '1',
      type: 'type',
      database: 'one',
      method: 'POST',
      path: '/SomeUser/1',
      auth: {
        uid: '1',
      },
    } as Request
    const rules = `{
      "rules_version": "1",
      "service": "cloud.lmdb",
      "/databases/{database}/documents": {
        "/MasterUserList/{userId}": {
          "read": "request.auth.uid != null && request.auth.uid == userId",
          "write": "request.auth.uid != null && request.auth.uid == userId"
        },
        "/{document=**}": {
          "read": false,
          "write": true
        }
      }
    }`
    const jsonRules = JSON.parse(rules) as Rules
    expect(validateRequestAgainstRules(request, jsonRules)).toBe(undefined)
  })
  test('read|auth.uid write|auth.uid global|read|false global|write|false', () => {
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
          "read": "request.auth.uid != null && request.auth.uid == userId",
          "write": "request.auth.uid != null && request.auth.uid == userId"
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
  test('read|auth.uid write|auth.uid global|read|false global|write|false', () => {
    const request = {
      id: '1',
      type: 'type',
      database: 'one',
      method: 'POST',
      path: '/MasterUserList/1',
      auth: {
        uid: '2',
      },
    } as Request
    const rules = `{
      "rules_version": "1",
      "service": "cloud.lmdb",
      "/databases/{database}/documents": {
        "/MasterUserList/{userId}": {
          "read": "request.auth.uid != null && request.auth.uid == userId",
          "write": "request.auth.uid != null && request.auth.uid == userId"
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
      expect(error.message).toBe('Invalid Permissions: Invalid Id')
    }
  })
})

describe('rules khan xrpl binary', () => {
  let testContext: EvernodeTestContext
  beforeAll(async () => {
    testContext = await setupClient()
  })

  test('write xrpl failure - read|auth.xrpl write|auth.xrpl', () => {
    const model = new MessageModel(
      BigInt(1685216402734),
      'LWslHQUc7liAGYUryIhoRNPDbWucJZjj',
      'This is a message'
    )
    const path = `/Messages/${testContext.alice.classicAddress}`
    const publicKey = testContext.bob.publicKey
    const privateKey = testContext.bob.privateKey
    const request = prepareRequest(
      '1',
      'one',
      'POST',
      path,
      model.encode(),
      publicKey,
      privateKey,
      model.getMetadata()
    ) as Request
    const rules = `{
      "rules_version": "1",
      "service": "cloud.lmdb",
      "/databases/{database}/documents": {
        "/Messages/{messageId}": {
          "read": "request.auth.uid != null && request.auth.uid == messageId && request.auth.type == xrpl",
          "write": "request.auth.uid != null && request.auth.uid == messageId && request.auth.type == xrpl"
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
      expect(error.message).toBe('Invalid Permissions: Invalid Id')
    }
  })

  test('write xrpl success - read|auth.xrpl write|auth.xrpl', () => {
    const model = new MessageModel(
      BigInt(1685216402734),
      'LWslHQUc7liAGYUryIhoRNPDbWucJZjj',
      'This is a message'
    )
    const path = `/Messages/${testContext.alice.classicAddress}`
    const publicKey = testContext.alice.publicKey
    const privateKey = testContext.alice.privateKey
    const binary = convertHexToString(path)
    const request = prepareRequest(
      '1',
      'one',
      'POST',
      path,
      binary,
      publicKey,
      privateKey,
      model.getMetadata()
    ) as Request
    const rules = `{
      "rules_version": "1",
      "service": "cloud.lmdb",
      "/databases/{database}/documents": {
        "/Messages/{messageId}": {
          "read": "request.auth.uid != null && request.auth.uid == messageId && request.auth.type == xrpl",
          "write": "request.auth.uid != null && request.auth.uid == messageId && request.auth.type == xrpl"
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
  test('read xrpl failure - read|auth.xrpl write|auth.xrpl', () => {
    const path = `/Messages/${testContext.alice.classicAddress}`
    const publicKey = testContext.bob.publicKey
    const privateKey = testContext.bob.privateKey
    const binary = convertHexToString(path)
    const request = prepareRequest(
      '1',
      'one',
      'GET',
      path,
      binary,
      publicKey,
      privateKey
    ) as Request
    const rules = `{
      "rules_version": "1",
      "service": "cloud.lmdb",
      "/databases/{database}/documents": {
        "/Messages/{messageId}": {
          "read": "request.auth.uid != null && request.auth.uid == messageId && request.auth.type == xrpl",
          "write": "request.auth.uid != null && request.auth.uid == messageId && request.auth.type == xrpl"
        },
        "/{document=**}": {
          "read": false,
          "write": false
        }
      }
    }`
    console.log(request)
    console.log(rules)
    const jsonRules = JSON.parse(rules) as Rules
    try {
      validateRequestAgainstRules(request, jsonRules)
    } catch (error: any) {
      expect(error.message).toBe('Invalid Permissions: Invalid Id')
    }
  })

  test('read xrpl success - read|auth.xrpl write|auth.xrpl', () => {
    const path = `/Messages/${testContext.alice.classicAddress}`
    const publicKey = testContext.alice.publicKey
    const privateKey = testContext.alice.privateKey
    const binary = convertHexToString(path)
    const request = prepareRequest(
      '1',
      'one',
      'GET',
      path,
      binary,
      publicKey,
      privateKey
    ) as Request
    const rules = `{
      "rules_version": "1",
      "service": "cloud.lmdb",
      "/databases/{database}/documents": {
        "/Messages/{messageId}": {
          "read": "request.auth.uid != null && request.auth.uid == messageId && request.auth.type == xrpl",
          "write": "request.auth.uid != null && request.auth.uid == messageId && request.auth.type == xrpl"
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
})
