import { Sdk, EverKeyPair } from '../../dist/npm/src/services/sdk'
import { MessageModel } from '../../dist/npm/src/models'
import { EvernodeTestContext, setupClient } from './util'

describe('sdk test', () => {
  let testContext: EvernodeTestContext
  beforeAll(async () => {
    testContext = await setupClient()
  })

  test('sdk - post', async () => {
    const model = new MessageModel(
      BigInt(1685216402734),
      'LWslHQUc7liAGYUryIhoRNPDbWucJZjj',
      'This is a message'
    )
    const address = testContext.alice.classicAddress
    const binary = model.encode()
    const sdk = new Sdk(
      'one',
      new EverKeyPair(
        testContext.alice.publicKey,
        testContext.alice.privateKey
      ),
      null
    )
    const ref = sdk.collection('Messages').document(address)
    const response = await ref.set(binary)
  })

  test('sdk - get', async () => {
    const address = testContext.bob.classicAddress
    const sdk = new Sdk(
      'one',
      new EverKeyPair(
        testContext.alice.publicKey,
        testContext.alice.privateKey
      ),
      null
    )
    const ref = sdk.collection('Messages').document(address)
    const response = await ref.get()
  })

  test('sdk - put', async () => {
    const address = testContext.bob.classicAddress
    const sdk = new Sdk(
      'one',
      new EverKeyPair(
        testContext.alice.publicKey,
        testContext.alice.privateKey
      ),
      null
    )
    const ref = sdk.collection('Messages').document(address)
    const model = new MessageModel(
      BigInt(1685216402734),
      'LWslHQUc7liAGYUryIhoRNPDbWucJZjj',
      'This is a new message'
    )
    const binary = model.encode()
    const response = await ref.update(binary)
  })

  test('sdk - delete', async () => {
    const address = testContext.alice.classicAddress
    const sdk = new Sdk(
      'one',
      new EverKeyPair(
        testContext.alice.publicKey,
        testContext.alice.privateKey
      ),
      null
    )
    const ref = sdk.collection('Messages').document(address)
    const response = await ref.delete()
  })
})
