import { RulesService } from '../../dist/npm/src/rules'
import { Request, Rules } from '../../dist/npm/src/rules/types'
import { MessageModel } from '../../dist/npm/src/models'
import { convertStringToHex } from '@transia/xrpl'
import { prepareRequest } from '../../dist/npm/src/services/api'
import { EvernodeTestContext, setupClient } from '../integration/util'

describe('rules - no permissions', () => {
  test('read failure - read|false write|false', async () => {
    const request = {
      id: '1',
      type: 'cloud.lmdb',
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
      const rulesService: RulesService = new RulesService(
        'test-id',
        request,
        jsonRules
      )
      await rulesService.validateRequestAgainstRules()
    } catch (error: any) {
      expect(error.message).toBe('Invalid Permissions')
    }
  })
  test('write failure - read|false write|false', async () => {
    const request = {
      id: '1',
      type: 'cloud.lmdb',
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
      const rulesService: RulesService = new RulesService(
        'test-id',
        request,
        jsonRules
      )
      await rulesService.validateRequestAgainstRules()
    } catch (error: any) {
      expect(error.message).toBe('Invalid Permissions')
    }
  })
})

describe('rules - read permissions', () => {
  test('read success - read|true write|false', async () => {
    const request = {
      id: '1',
      type: 'cloud.lmdb',
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
    const rulesService: RulesService = new RulesService(
      'test-id',
      request,
      jsonRules
    )
    expect(await rulesService.validateRequestAgainstRules()).toBe(undefined)
  })
  test('write failure - read|true write|false', async () => {
    const request = {
      id: '1',
      type: 'cloud.lmdb',
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
      const rulesService: RulesService = new RulesService(
        'test-id',
        request,
        jsonRules
      )
      await rulesService.validateRequestAgainstRules()
    } catch (error: any) {
      expect(error.message).toBe('Invalid Permissions')
    }
  })
})

describe('rules - read/write permissions', () => {
  test('read success - read|true write|true', async () => {
    const request = {
      id: '1',
      type: 'cloud.lmdb',
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
    const rulesService: RulesService = new RulesService(
      'test-id',
      request,
      jsonRules
    )
    expect(await rulesService.validateRequestAgainstRules()).toBe(undefined)
  })
  test('write success - read|true write|false', async () => {
    const request = {
      id: '1',
      type: 'cloud.lmdb',
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
    const rulesService: RulesService = new RulesService(
      'test-id',
      request,
      jsonRules
    )
    expect(await rulesService.validateRequestAgainstRules()).toBe(undefined)
  })
})

describe('rules - read/write collection permissions', () => {
  test('read collection failure - read|false write|false', async () => {
    const request = {
      id: '1',
      type: 'cloud.lmdb',
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
      const rulesService: RulesService = new RulesService(
        'test-id',
        request,
        jsonRules
      )
      await rulesService.validateRequestAgainstRules()
    } catch (error: any) {
      expect(error.message).toBe('Invalid Permissions')
    }
  })
  test('write collection failure - read|false write|false', async () => {
    const request = {
      id: '1',
      type: 'cloud.lmdb',
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
      const rulesService: RulesService = new RulesService(
        'test-id',
        request,
        jsonRules
      )
      await rulesService.validateRequestAgainstRules()
    } catch (error: any) {
      expect(error.message).toBe('Invalid Permissions')
    }
  })
  test('read collection success - read|true write|false', async () => {
    const request = {
      id: '1',
      type: 'cloud.lmdb',
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
    const rulesService: RulesService = new RulesService(
      'test-id',
      request,
      jsonRules
    )
    expect(await rulesService.validateRequestAgainstRules()).toBe(undefined)
  })
  test('write collection success - read|true write|true', async () => {
    const request = {
      id: '1',
      type: 'cloud.lmdb',
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
    const rulesService: RulesService = new RulesService(
      'test-id',
      request,
      jsonRules
    )
    expect(await rulesService.validateRequestAgainstRules()).toBe(undefined)
  })
  test('read outside collection failure - read|true write|false', async () => {
    const request = {
      id: '1',
      type: 'cloud.lmdb',
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
      const rulesService: RulesService = new RulesService(
        'test-id',
        request,
        jsonRules
      )
      await rulesService.validateRequestAgainstRules()
      throw Error('invalid')
    } catch (error: any) {
      expect(error.message).toBe('Invalid Permissions')
    }
  })
  test('write outside collection failure - read|true write|true', async () => {
    const request = {
      id: '1',
      type: 'cloud.lmdb',
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
      const rulesService: RulesService = new RulesService(
        'test-id',
        request,
        jsonRules
      )
      await rulesService.validateRequestAgainstRules()
      throw Error('invalid')
    } catch (error: any) {
      expect(error.message).toBe('Invalid Permissions')
    }
  })
})

describe('rules - read | auth.uid', () => {
  test('read|auth.uid write|auth.uid global|read|false global|write|false - failure', async () => {
    const request = {
      id: '1',
      type: 'cloud.lmdb',
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
      const rulesService: RulesService = new RulesService(
        'test-id',
        request,
        jsonRules
      )
      await rulesService.validateRequestAgainstRules()
    } catch (error: any) {
      expect(error.message).toBe('Invalid Permissions')
    }
  })
  test('read|auth.uid write|auth.uid global|read|true global|write|false - success', async () => {
    const request = {
      id: '1',
      type: 'cloud.lmdb',
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
    const rulesService: RulesService = new RulesService(
      'test-id',
      request,
      jsonRules
    )
    expect(await rulesService.validateRequestAgainstRules()).toBe(undefined)
  })
  test('read|auth.uid write|auth.uid global|read|false global|write|false - failure', async () => {
    const request = {
      id: '1',
      type: 'cloud.lmdb',
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
    try {
      const rulesService: RulesService = new RulesService(
        'test-id',
        request,
        jsonRules
      )
      await rulesService.validateRequestAgainstRules()
    } catch (error: any) {
      expect(error.message).toBe('Invalid Xrpl Signature Parameters')
    }
  })
  test('read|auth.uid write|auth.uid global|read|false global|write|false - success', async () => {
    const request = {
      id: '1',
      type: 'cloud.lmdb',
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
      const rulesService: RulesService = new RulesService(
        'test-id',
        request,
        jsonRules
      )
      await rulesService.validateRequestAgainstRules()
    } catch (error: any) {
      expect(error.message).toBe('Invalid Permissions: Invalid Id')
    }
  })
})

describe('rules - write | auth.uid', () => {
  test('read|auth.uid write|auth.uid global|read|false global|write|false - failure', async () => {
    const request = {
      id: '1',
      type: 'cloud.lmdb',
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
      const rulesService: RulesService = new RulesService(
        'test-id',
        request,
        jsonRules
      )
      await rulesService.validateRequestAgainstRules()
    } catch (error: any) {
      expect(error.message).toBe('Invalid Permissions')
    }
  })
  test('read|auth.uid write|auth.uid global|read|true global|write|false - success', async () => {
    const request = {
      id: '1',
      type: 'cloud.lmdb',
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
    const rulesService: RulesService = new RulesService(
      'test-id',
      request,
      jsonRules
    )
    expect(await rulesService.validateRequestAgainstRules()).toBe(undefined)
  })
  test('read|auth.uid write|auth.uid global|read|false global|write|false - success', async () => {
    const request = {
      id: '1',
      type: 'cloud.lmdb',
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
    try {
      const rulesService: RulesService = new RulesService(
        'test-id',
        request,
        jsonRules
      )
      await rulesService.validateRequestAgainstRules()
    } catch (error: any) {
      expect(error.message).toBe('Invalid Xrpl Signature Parameters')
    }
  })
  test('read|auth.uid write|auth.uid global|read|false global|write|false - failure', async () => {
    const request = {
      id: '1',
      type: 'cloud.lmdb',
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
      const rulesService: RulesService = new RulesService(
        'test-id',
        request,
        jsonRules
      )
      await rulesService.validateRequestAgainstRules()
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

  test('write xrpl failure - read|auth.xrpl write|auth.xrpl', async () => {
    const model = new MessageModel(
      BigInt(1685216402734),
      'LWslHQUc7liAGYUryIhoRNPDbWucJZjj',
      'This is a message'
    )
    const request = prepareRequest(
      '1',
      'cloud.lmdb',
      'one',
      'POST',
      `/Messages/${testContext.alice.classicAddress}`,
      model.encode(),
      testContext.bob.publicKey,
      testContext.bob.privateKey,
      model.getMetadata()
    ) as Request
    const rules = `{
      "rules_version": "1",
      "service": "cloud.lmdb",
      "/databases/{database}/documents": {
        "/Messages/{messageId}": {
          "read": "request.auth.uid != null && request.auth.uid == messageId",
          "write": "request.auth.uid != null && request.auth.uid == messageId"
        },
        "/{document=**}": {
          "read": false,
          "write": false
        }
      }
    }`
    const jsonRules = JSON.parse(rules) as Rules
    try {
      const rulesService: RulesService = new RulesService(
        'test-id',
        request,
        jsonRules
      )
      await rulesService.validateRequestAgainstRules()
    } catch (error: any) {
      expect(error.message).toBe('Invalid Permissions: Invalid Id')
    }
  })

  test('write xrpl success - read|auth.xrpl write|auth.xrpl', async () => {
    const model = new MessageModel(
      BigInt(1685216402734),
      'LWslHQUc7liAGYUryIhoRNPDbWucJZjj',
      'This is a message'
    )
    const path = `/Messages/${testContext.alice.classicAddress}`
    const publicKey = testContext.alice.publicKey
    const privateKey = testContext.alice.privateKey
    const request = prepareRequest(
      '1',
      'cloud.lmdb',
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
          "read": "request.auth.uid != null && request.auth.uid == messageId",
          "write": "request.auth.uid != null && request.auth.uid == messageId"
        },
        "/{document=**}": {
          "read": false,
          "write": false
        }
      }
    }`
    const jsonRules = JSON.parse(rules) as Rules
    const rulesService: RulesService = new RulesService(
      'test-id',
      request,
      jsonRules
    )
    expect(await rulesService.validateRequestAgainstRules()).toBe(undefined)
  })

  test('read xrpl failure - read|auth.xrpl write|auth.xrpl', async () => {
    const path = `/Messages/${testContext.alice.classicAddress}`
    const publicKey = testContext.bob.publicKey
    const privateKey = testContext.bob.privateKey
    const binaryPath = convertStringToHex(path)
    const request = prepareRequest(
      '1',
      'cloud.lmdb',
      'one',
      'GET',
      path,
      binaryPath,
      publicKey,
      privateKey
    ) as Request
    const rules = `{
      "rules_version": "1",
      "service": "cloud.lmdb",
      "/databases/{database}/documents": {
        "/Messages/{messageId}": {
          "read": "request.auth.uid != null && request.auth.uid == messageId",
          "write": "request.auth.uid != null && request.auth.uid == messageId"
        },
        "/{document=**}": {
          "read": false,
          "write": false
        }
      }
    }`
    const jsonRules = JSON.parse(rules) as Rules
    try {
      const rulesService: RulesService = new RulesService(
        'test-id',
        request,
        jsonRules
      )
      await rulesService.validateRequestAgainstRules()
    } catch (error: any) {
      expect(error.message).toBe('Invalid Permissions: Invalid Id')
    }
  })

  test('read xrpl success - read|auth.xrpl write|auth.xrpl', async () => {
    const path = `/Messages/${testContext.alice.classicAddress}`
    const publicKey = testContext.alice.publicKey
    const privateKey = testContext.alice.privateKey
    const binaryPath = convertStringToHex(path)
    const request = prepareRequest(
      '1',
      'cloud.lmdb',
      'one',
      'GET',
      path,
      binaryPath,
      publicKey,
      privateKey
    ) as Request
    const rules = `{
      "rules_version": "1",
      "service": "cloud.lmdb",
      "/databases/{database}/documents": {
        "/Messages/{messageId}": {
          "read": "request.auth.uid != null && request.auth.uid == messageId",
          "write": "request.auth.uid != null && request.auth.uid == messageId"
        },
        "/{document=**}": {
          "read": false,
          "write": false
        }
      }
    }`
    const jsonRules = JSON.parse(rules) as Rules
    const rulesService: RulesService = new RulesService(
      'test-id',
      request,
      jsonRules
    )
    expect(await rulesService.validateRequestAgainstRules()).toBe(undefined)
  })
})
