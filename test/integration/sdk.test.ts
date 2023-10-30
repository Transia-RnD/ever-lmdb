import { Sdk, EverKeyPair } from '../../dist/npm/src/services/sdk'
import {
  ChatModel,
  OwnerModel,
  ObjectRefModel,
} from '../../dist/npm/src/models'
import { EvernodeTestContext, setupClient } from './util'
import { MockClientApp } from './mockClient'

describe('sdk nested test', () => {
  let testContext: EvernodeTestContext
  let hpApp: MockClientApp

  beforeAll(async () => {
    testContext = await setupClient()
    const hpClient = new MockClientApp()
    if (await hpClient.init()) {
      hpApp = hpClient
    }
  })

  test('sdk - getPath collection/document', async () => {
    const aliceWallet = testContext.alice
    const sdk = new Sdk(
      new EverKeyPair(aliceWallet.publicKey, aliceWallet.privateKey),
      hpApp,
      'db'
    )

    const accountsRef = sdk.collection('Accounts')
    const accountRef = accountsRef.document('uPIMOHLDM9Oulk8cVzFVurEcbmnlyZSi')
    const chatsRef = accountRef.collection('Chats')
    const chatRef = chatsRef.document('WvxJE167KqzTHJh18g8GFPyEBz5JkWGi')
    expect(accountsRef.doc).toBe(null)
    expect(accountsRef.parent).toBe(null)
    expect(accountsRef.path).toBe('Accounts')
    expect(accountsRef.getPath()).toBe(`/Accounts`)
    expect(accountRef.col?.doc).toBe(null)
    expect(accountRef.getPath()).toBe(
      `/Accounts/uPIMOHLDM9Oulk8cVzFVurEcbmnlyZSi`
    )
    expect(accountRef.col?.getPath()).toBe(`/Accounts`)
    expect(chatsRef.doc).toBeDefined()
    expect(chatsRef.parent).toBeDefined()
    expect(chatsRef.path).toBe('Chats')
    expect(chatsRef.getPath()).toBe(
      `/Accounts/uPIMOHLDM9Oulk8cVzFVurEcbmnlyZSi/Chats`
    )
    expect(chatRef.getPath()).toBe(
      `/Accounts/uPIMOHLDM9Oulk8cVzFVurEcbmnlyZSi/Chats/WvxJE167KqzTHJh18g8GFPyEBz5JkWGi`
    )
  })
  test('sdk - post', async () => {
    const aliceAddress = testContext.alice.classicAddress
    const bobAddress = testContext.bob.classicAddress

    const sdk = new Sdk(
      new EverKeyPair(
        testContext.alice.publicKey,
        testContext.alice.privateKey
      ),
      hpApp,
      'db'
    )

    const owner1 = new OwnerModel(aliceAddress)
    const owner2 = new OwnerModel(bobAddress)
    const chatModel = new ChatModel(owner1.account, [owner1, owner2])

    const accountRef = sdk.collection('Accounts').document(aliceAddress)
    const accountChatRef = accountRef.collection('Chats').document()

    accountChatRef.withConverter(ObjectRefModel)
    const newChatRef = sdk.collection('Chats').document(accountChatRef.path)
    newChatRef.withConverter(ChatModel)

    const objectRefModel = new ObjectRefModel(
      newChatRef.path,
      BigInt(0),
      aliceAddress
    )

    await newChatRef.set(chatModel)
    await accountChatRef.set(objectRefModel)

    const getResponse = (await newChatRef.get()) as ChatModel
    expect(getResponse.createdBy).toBe(owner1.account)
    expect(getResponse.owners.length).toBe(2)
    expect(getResponse.owners[0].account).toBe(owner1.account)
    expect(getResponse.owners[1].account).toBe(owner2.account)

    const listResponse = (await accountRef
      .collection('Chats')
      .withConverter(ObjectRefModel)
      .list()) as ObjectRefModel[]
    expect(listResponse[0].ref).toBe(newChatRef.path)
  })
})

// describe('sdk chat test', () => {
//   let testContext: EvernodeTestContext
//   let hpApp: MockClientApp

//   beforeAll(async () => {
//     testContext = await setupClient()
//     const hpClient = new MockClientApp()
//     if (await hpClient.init()) {
//       hpApp = hpClient
//     }
//   })

//   test('sdk - post', async () => {
//     const aliceAddress = testContext.alice.classicAddress
//     const bobAddress = testContext.bob.classicAddress

//     const sdk = new Sdk(
//       new EverKeyPair(
//         testContext.alice.publicKey,
//         testContext.alice.privateKey
//       ),
//       hpApp,
//       'db'
//     )

//     const owner1 = new OwnerModel(aliceAddress)
//     const owner2 = new OwnerModel(bobAddress)
//     const chatModel = new ChatModel(owner1.account, [owner1, owner2])

//     const chatRef = sdk.collection('Chats').document()
//     chatRef.withConverter(ChatModel)
//     await chatRef.set(chatModel)

//     const getResponse = (await chatRef.get()) as ChatModel
//     expect(getResponse.createdBy).toBe(owner1.account)
//     expect(getResponse.owners.length).toBe(2)
//     expect(getResponse.owners[0].account).toBe(owner1.account)
//     expect(getResponse.owners[1].account).toBe(owner2.account)
//   })

//   test('sdk - list', async () => {
//     const aliceAddress = testContext.alice.classicAddress
//     const bobAddress = testContext.bob.classicAddress

//     const sdk = new Sdk(
//       new EverKeyPair(
//         testContext.alice.publicKey,
//         testContext.alice.privateKey
//       ),
//       hpApp,
//       'db'
//     )

//     const owner1 = new OwnerModel(aliceAddress)
//     const owner2 = new OwnerModel(bobAddress)
//     const chatModel = new ChatModel(owner1.account, [owner1, owner2])

//     const chatsRef = sdk.collection('Chats')
//     const chatRef = chatsRef.document()
//     chatRef.withConverter(ChatModel)
//     await chatRef.set(chatModel)

//     const listResponse = (await chatsRef.list()) as ChatModel[]
//     console.log(listResponse)

//     expect(listResponse[0].createdBy).toBe(owner1.account)
//     expect(listResponse[0].owners.length).toBe(2)
//     expect(listResponse[0].owners[0].account).toBe(owner1.account)
//     expect(listResponse[0].owners[1].account).toBe(owner2.account)
//   })

//   test('sdk - update', async () => {
//     const aliceAddress = testContext.alice.classicAddress
//     const bobAddress = testContext.bob.classicAddress
//     const carolAddress = testContext.carol.classicAddress

//     const sdk = new Sdk(
//       new EverKeyPair(
//         testContext.alice.publicKey,
//         testContext.alice.privateKey
//       ),
//       hpApp,
//       'db'
//     )

//     const owner1 = new OwnerModel(aliceAddress)
//     const owner2 = new OwnerModel(bobAddress)
//     const owner3 = new OwnerModel(carolAddress)
//     const chatModel = new ChatModel(owner1.account, [owner1, owner2])

//     const chatRef = sdk.collection('Chats').document()
//     chatRef.withConverter(ChatModel)
//     await chatRef.set(chatModel)

//     const setResponse = (await chatRef.get()) as ChatModel
//     expect(setResponse.createdBy).toBe(owner1.account)
//     expect(setResponse.owners.length).toBe(2)
//     expect(setResponse.owners[0].account).toBe(owner1.account)
//     expect(setResponse.owners[1].account).toBe(owner2.account)

//     const updateModel = new ChatModel(owner1.account, [owner1, owner3])
//     await chatRef.update(updateModel)
//     const updateResponse = (await chatRef.get()) as ChatModel
//     expect(updateResponse.createdBy).toBe(owner1.account)
//     expect(updateResponse.owners.length).toBe(2)
//     expect(updateResponse.owners[0].account).toBe(owner1.account)
//     expect(updateResponse.owners[1].account).toBe(owner3.account)
//   })

//   test('sdk - delete', async () => {
//     const aliceAddress = testContext.alice.classicAddress
//     const bobAddress = testContext.bob.classicAddress

//     const sdk = new Sdk(
//       new EverKeyPair(
//         testContext.alice.publicKey,
//         testContext.alice.privateKey
//       ),
//       hpApp,
//       'db'
//     )

//     const owner1 = new OwnerModel(aliceAddress)
//     const owner2 = new OwnerModel(bobAddress)
//     const chatModel = new ChatModel(owner1.account, [owner1, owner2])

//     const chatRef = sdk.collection('Chats').document()
//     chatRef.withConverter(ChatModel)
//     await chatRef.set(chatModel)

//     const setResponse = (await chatRef.get()) as ChatModel
//     expect(setResponse.createdBy).toBe(owner1.account)
//     expect(setResponse.owners.length).toBe(2)
//     expect(setResponse.owners[0].account).toBe(owner1.account)
//     expect(setResponse.owners[1].account).toBe(owner2.account)

//     await chatRef.delete()
//     try {
//       const deleteResponse = (await chatRef.get()) as ChatModel
//       console.log(deleteResponse)
//     } catch (error: any) {
//       console.log(error)

//       expect(error.message).toBe('No Data')
//     }
//   })
// })
// describe('sdk message test', () => {
//   let testContext: EvernodeTestContext
//   let hpApp: MockClientApp

//   beforeAll(async () => {
//     testContext = await setupClient()
//     const hpClient = new MockClientApp()
//     if (await hpClient.init()) {
//       hpApp = hpClient
//     }
//   })

//   test('sdk - post', async () => {
//     const model = new MessageModel(
//       BigInt(1685216402734),
//       'LWslHQUc7liAGYUryIhoRNPDbWucJZjj',
//       'This is a message'
//     )
//     const address = testContext.alice.classicAddress
//     const sdk = new Sdk(
//       new EverKeyPair(
//         testContext.alice.publicKey,
//         testContext.alice.privateKey
//       ),
//       hpApp
//     )
//     const ref = sdk.collection('Messages').document(address)
//     await ref.set(model)
//   })

//   test('sdk - get', async () => {
//     const address = testContext.bob.classicAddress
//     const sdk = new Sdk(
//       new EverKeyPair(
//         testContext.alice.publicKey,
//         testContext.alice.privateKey
//       ),
//       hpApp
//     )
//     const ref = sdk
//       .collection('Messages')
//       .document(address)
//       .withConverter(MessageModel)
//     const response = await ref.get()
//     console.log(response)
//   })

//   test('sdk - put', async () => {
//     const address = testContext.bob.classicAddress
//     const sdk = new Sdk(
//       new EverKeyPair(
//         testContext.alice.publicKey,
//         testContext.alice.privateKey
//       ),
//       hpApp
//     )
//     const ref = sdk.collection('Messages').document(address)
//     const model = new MessageModel(
//       BigInt(1685216402734),
//       'LWslHQUc7liAGYUryIhoRNPDbWucJZjj',
//       'This is a new message'
//     )
//     await ref.update(model)
//   })

//   test('sdk - delete', async () => {
//     const address = testContext.alice.classicAddress
//     const sdk = new Sdk(
//       new EverKeyPair(
//         testContext.alice.publicKey,
//         testContext.alice.privateKey
//       ),
//       hpApp
//     )
//     const ref = sdk.collection('Messages').document(address)
//     await ref.delete()
//   })
// })
