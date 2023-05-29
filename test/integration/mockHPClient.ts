// import HotPocket from 'hotpocket-js-client'
// import { MessageModel } from 'ever-library/dist/npm/src/models'
// import { Sdk } from 'ever-library/dist/npm/src/services/sdk'
// import { deriveAddress } from 'ripple-keypairs'
// const lmdb = require('node-lmdb');

// const nodeIp = process.env.REACT_APP_CONTRACT_NODE_IP || 'localhost'
// const nodePort = process.env.REACT_APP_CONTRACT_NODE_PORT || '8081'

class InputStatus {
  status = ''
  reason = ''
  constructor(status, reason) {
    this.status = status
    this.reason = reason
  }
}
class Input {
  input = ''
  constructor(input) {
    this.input = input
  }

  async submissionStatus() {
    return new Promise((resolve) => {
      resolve(new InputStatus('accepted', 'Mock Reason'))
    })
  }
}
class Output {
  error = ''
  success = ''
  constructor(input) {
    this.input = input
  }
}

class MockClient {
  postInput = ''
  getInput = ''

  async submitContractInput(input) {
    return new Promise((resolve) => {
      if (JSON.parse(input).command === 'create') {
        this.postInput = input
      }
      console.log(`MOCK POST: ${this.postInput}`)
      resolve(new Input(this.postInput))
    })
  }

  async submitContractReadRequest(input) {
    return new Promise((resolve) => {
      console.log(`MOCK GET: ${input}`)
      this.getInput = input
      resolve(this.getInput)
    })
  }
}

class MockResponse {
  id = ''
  data = ''
  constructor(id, data = null) {
    this.id = id
    if (data) {
      this.data = JSON.parse(data).data
    }
  }
}

class ClientApp {
  // Provide singleton instance
  static instance = ClientApp.instance || new ClientApp()

  userKeyPair = null
  client = null
  isInitCalled = false
  promiseMap = new Map()

  async init() {
    console.log('Initialized')
    if (this.userKeyPair == null) {
      this.userKeyPair = await HotPocket.generateKeys()
    }
    this.client = new MockClient()
    this.isInitCalled = true

    return true
  }
}

// declare all characters
const characters =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

function generateKey(length) {
  let result = ' '
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

function hexKey(key) {
  return key
    .reduce(
      (accumulator, value) => accumulator + value.toString(16).padStart(2, '0'),
      ''
    )
    .toUpperCase()
}

async function main() {
  var client = new ClientApp()
  if (await client.init()) {
    const userId = generateKey(32)
    console.log(userId)

    // POST
    const model = new MessageModel(
      BigInt(1685216402734),
      'LWslHQUc7liAGYUryIhoRNPDbWucJZjj',
      'This is a message'
    )
    const keypair = {
      publicKey: hexKey(client.userKeyPair.publicKey),
      privateKey: hexKey(client.userKeyPair.privateKey),
    }
    console.log(keypair)
    const binary = model.encode()
    const sdk = new Sdk('one', keypair, client.client)
    const ref = sdk
      .collection('Messages')
      .document(deriveAddress(keypair.publicKey))
    const response = await ref.set(binary)
    console.log(response)
    // const response = await client.create(userId, "This is a message");
    // console.log(response.id);
    // const messageData = await client.get(response.id);
    // console.log(messageData);
  }
}
main()
