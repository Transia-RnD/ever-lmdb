import { ApiService } from '../../dist/npm/src/services/api'
class User {
  publicKey = ''
  inputs: Buffer[] = []
  response: any = undefined
  constructor(publicKey: string, inputs: Buffer[]) {
    this.publicKey = publicKey
    this.inputs = inputs
  }
  async send(response: any) {
    this.response = response
    return new Promise((resolve) => {
      resolve(response)
    })
  }
}

class InputStatus {
  status = ''
  reason = ''
  constructor(status: string, reason: string) {
    this.status = status
    this.reason = reason
  }
}
class Input {
  input = ''
  constructor(input: string) {
    this.input = input
  }

  get submissionStatus() {
    return new Promise((resolve) => {
      resolve(new InputStatus('accepted', 'Mock Reason'))
    })
  }
}

class MockClient {
  postInput = ''
  getInput = ''
  api = new ApiService('test-id')

  callbackFunction: null | ((r: any) => any) = null

  async on(callback: (r: any) => any) {
    this.callbackFunction = callback
  }

  async submitContractInput(input: string) {
    return new Promise(async (resolve) => {
      console.log(`MOCK POST: ${input}`)
      const inputs = [Buffer.from(JSON.stringify(input))]
      const user = new User(
        'ed2593d14ca75a4970acd3fb8696e345c0baf6a43449ac2be9d8538b00d869dd7e',
        inputs
      )

      await this.api.handleRequest('test-id', user, JSON.parse(input), true)
      console.log(user.response)

      resolve(new Input(user.response))
      new Promise(() => {
        setTimeout(() => {
          this.callbackFunction &&
            this.callbackFunction({ outputs: [{ id: JSON.parse(input).id }] })
        }, 1500)
      })
    })
  }

  async submitContractReadRequest(input: string) {
    return new Promise(async (resolve) => {
      console.log(`MOCK GET: ${input}`)
      const inputs = [Buffer.from(JSON.stringify(input))]
      const user = new User(
        'ed2593d14ca75a4970acd3fb8696e345c0baf6a43449ac2be9d8538b00d869dd7e',
        inputs
      )
      await this.api.handleRequest('test-id', user, JSON.parse(input), true)
      resolve(user.response)
    })
  }
}

export class MockClientApp {
  // Provide singleton instance
  // @ts-expect-error - leave this alone
  static instance = MockClientApp.instance || new MockClientApp()

  userKeyPair: Record<string, any> | null
  client: MockClient | null
  isInitCalled = false
  promiseMap = new Map()

  async init() {
    console.log('Initialized')
    if (this.userKeyPair == null) {
      this.userKeyPair = {
        publicKey:
          'ED0807B9DA22DEBA87ABCBF8F5E9CF242F585158AA5D653CDB080AB04B0A8A6E89',
        privateKey:
          'ED86EB7A3DB392BCA921259F722BBA46B0B742678BFEABA198B2FE7EB7C776F3220807B9DA22DEBA87ABCBF8F5E9CF242F585158AA5D653CDB080AB04B0A8A6E89',
      }
    }
    this.client = new MockClient()

    // This will get fired when contract sends outputs.
    this.client.on((r: any) => {
      r.outputs.forEach((o: any) => {
        const pId = o.id
        if (o.error) {
          this.promiseMap.get(pId).rejecter(o.error)
        } else {
          this.promiseMap.get(pId).resolver(o.success)
        }
        this.promiseMap.delete(pId)
      })
    })

    this.isInitCalled = true
    return true
  }
}
