import { Sdk, EverKeyPair } from '../../dist/npm/src/services/sdk'
import { MessageModel } from '../../dist/npm/src/models'
import { EvernodeTestContext, setupClient } from './util'
import { MockClientApp } from './mockClient'

describe('sdk test', () => {
  let testContext: EvernodeTestContext
  let hpApp: MockClientApp

  beforeAll(async () => {
    testContext = await setupClient()
    const hpClient = new MockClientApp()
    if (await hpClient.init()) {
      hpApp = hpClient
    }
  })

  test('sdk - post', async () => {
    const model = new MessageModel(
      BigInt(1685216402734),
      'LWslHQUc7liAGYUryIhoRNPDbWucJZjj',
      'This is a message'
    )
    const address = testContext.alice.classicAddress
    const sdk = new Sdk(
      new EverKeyPair(
        testContext.alice.publicKey,
        testContext.alice.privateKey
      ),
      hpApp
    )
    const ref = sdk.collection('Messages').document(address)
    await ref.set(model)
  })

  test('sdk - get', async () => {
    const address = testContext.bob.classicAddress
    const sdk = new Sdk(
      new EverKeyPair(
        testContext.alice.publicKey,
        testContext.alice.privateKey
      ),
      hpApp
    )
    const ref = sdk.collection('Messages').document(address)
    const response = await ref.get()
    console.log(response)
  })

  test('sdk - put', async () => {
    const address = testContext.bob.classicAddress
    const sdk = new Sdk(
      new EverKeyPair(
        testContext.alice.publicKey,
        testContext.alice.privateKey
      ),
      hpApp
    )
    const ref = sdk.collection('Messages').document(address)
    const model = new MessageModel(
      BigInt(1685216402734),
      'LWslHQUc7liAGYUryIhoRNPDbWucJZjj',
      'This is a new message'
    )
    await ref.update(model)
  })

  test('sdk - delete', async () => {
    const address = testContext.alice.classicAddress
    const sdk = new Sdk(
      new EverKeyPair(
        testContext.alice.publicKey,
        testContext.alice.privateKey
      ),
      hpApp
    )
    const ref = sdk.collection('Messages').document(address)
    await ref.delete()
  })
})
