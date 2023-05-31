// import HotPocket from 'hotpocket-js-client'

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

  callbackFunction: null | ((r: any) => any) = null

  async on(callback: (r: any) => any) {
    this.callbackFunction = callback
  }

  async submitContractInput(input: string) {
    return new Promise((resolve) => {
      if (JSON.parse(input).method === 'POST') {
        this.postInput = input
      }
      console.log(`MOCK POST: ${this.postInput}`)
      resolve(new Input(this.postInput))
      new Promise(() => {
        setTimeout(() => {
          this.callbackFunction &&
            this.callbackFunction({ outputs: [{ id: JSON.parse(input).id }] })
        }, 1500)
      })
    })
  }

  async submitContractReadRequest(input: string) {
    return new Promise((resolve) => {
      console.log(`MOCK GET: ${input}`)
      this.getInput = input
      resolve(this.getInput)
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
