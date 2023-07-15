// import { convertStringToHex } from 'xrpl'
import fs from 'fs'
import path from 'path'
import { ApiService, prepareRequest } from '../../dist/npm/src/services/api'
import { User } from '../../dist/npm/src/services/types'
import { ChatModel, MessageModel, OwnerModel } from '../../dist/npm/src/models'
// import { decodeModel } from '../../dist/npm/src/util/decode'
import { EvernodeTestContext, setupClient } from './util'
import { decodeMetadata } from '../../dist/npm/src/util/decode'
import { convertHexToString } from 'xrpl'
import { generateKey } from '../../dist/npm/src/util'

console.log(generateKey)
console.log(MessageModel)
console.log(ChatModel)
console.log(OwnerModel)

export function readFile(filename: string): string {
  const jsonString = fs.readFileSync(
    path.resolve(__dirname, `../fixtures/${filename}`)
  )
  return jsonString.toString()
}

// describe('Chats/{id}', () => {
//   let testContext: EvernodeTestContext
//   beforeAll(async () => {
//     testContext = await setupClient()
//   })

//   test('lmdb - full', async () => {
//     const aliceWallet = testContext.alice
//     const bobWallet = testContext.bob
//     const owner1 = new OwnerModel(aliceWallet.classicAddress)
//     const owner2 = new OwnerModel(bobWallet.classicAddress)
//     console.log(owner2)

//     const chatModel = new ChatModel(owner1.account, [owner1])

//     // const path = `/Chats/${generateKey(20)}`
//     const path = `/Chats/JrqfNImIw4XwsqF7sT3o`
//     const binaryPath = convertHexToString(path)

//     const api = new ApiService()
//     const isReadOnly = false

//     // ALICE USER
//     const aliceUser: User = {
//       publicKey: aliceWallet.publicKey,
//       inputs: [],
//       send: function (response: any): void {
//         console.log(`ALICE RESPONSE: ${response.id}`)
//         console.log(response)
//         if (response && response.snapshot && response.snapshot.binary) {
//           const decoded = decodeMetadata(
//             response.snapshot.binary,
//             response.snapshot.metadata
//           )
//           console.log(decoded)
//         }
//         return
//       },
//     }
//     // BOB USER
//     const bobUser: User = {
//       publicKey: bobWallet.publicKey,
//       inputs: [],
//       send: function (response: any): void {
//         console.log(`BOB RESPONSE: ${response.id}`)
//         console.log(response)
//         if (response && response.snapshot && response.snapshot.binary) {
//           const decoded = decodeMetadata(
//             response.snapshot.binary,
//             response.snapshot.metadata
//           )
//           console.log(decoded)
//         }
//         return
//       },
//     }

//     // POST - Alice
//     const postRequest = prepareRequest(
//       'alice-post-id',
//       'one',
//       'POST',
//       path,
//       chatModel.encode(),
//       aliceWallet.publicKey,
//       aliceWallet.privateKey,
//       chatModel.getMetadata()
//     )
//     const postChatInputs = [Buffer.from(JSON.stringify(postRequest))]
//     aliceUser.inputs = postChatInputs
//     await api.handleRequest(aliceUser, postRequest, isReadOnly)

//     // GET - Alice
//     const aliceGetRequest = prepareRequest(
//       'alice-get-id',
//       'one',
//       'GET',
//       path,
//       binaryPath,
//       aliceWallet.publicKey,
//       aliceWallet.privateKey
//     )
//     const aliceGetInputs = [Buffer.from(JSON.stringify(aliceGetRequest))]
//     bobUser.inputs = aliceGetInputs
//     await api.handleRequest(aliceUser, aliceGetRequest, isReadOnly)

//     // GET - Bob
//     const bobGetRequest = prepareRequest(
//       'bob-get-id',
//       'one',
//       'GET',
//       path,
//       binaryPath,
//       bobWallet.publicKey,
//       bobWallet.privateKey
//     )
//     const bobGetInputs = [Buffer.from(JSON.stringify(bobGetRequest))]
//     bobUser.inputs = bobGetInputs
//     await api.handleRequest(bobUser, bobGetRequest, isReadOnly)

//     // PUT - Alice
//     // chatModel.owners = [owner1, owner2]
//     // const putRequest = prepareRequest(
//     //   'alice-put-id',
//     //   'one',
//     //   'PUT',
//     //   path,
//     //   chatModel.encode(),
//     //   aliceWallet.publicKey,
//     //   aliceWallet.privateKey,
//     //   chatModel.getMetadata()
//     // )
//     // const putChatInputs = [Buffer.from(JSON.stringify(putRequest))]
//     // aliceUser.inputs = putChatInputs
//     // await api.handleRequest(aliceUser, putRequest, isReadOnly)

//     // // GET - Alice
//     // const getRequest = prepareRequest(
//     //   'alice-get-id',
//     //   'one',
//     //   'GET',
//     //   path,
//     //   binaryPath,
//     //   aliceWallet.publicKey,
//     //   aliceWallet.privateKey
//     // )
//     // const getChatInputs = [Buffer.from(JSON.stringify(getRequest))]
//     // aliceUser.inputs = getChatInputs
//     // await api.handleRequest(aliceUser, getRequest, isReadOnly)

//     // DELETE - Alice
//     // const deleteRequest = prepareRequest(
//     //   'alice-delete-id',
//     //   'one',
//     //   'DELETE',
//     //   path,
//     //   chatModel.encode(),
//     //   aliceWallet.publicKey,
//     //   aliceWallet.privateKey,
//     //   chatModel.getMetadata()
//     // )
//     // const deleteChatInputs = [Buffer.from(JSON.stringify(deleteRequest))]
//     // aliceUser.inputs = deleteChatInputs
//     // await api.handleRequest(aliceUser, deleteRequest, isReadOnly)
//   })
// })

describe('Chats/{id}/Messages', () => {
  let testContext: EvernodeTestContext
  beforeAll(async () => {
    testContext = await setupClient()
  })

  test('lmdb - full', async () => {
    const aliceWallet = testContext.alice
    const bobWallet = testContext.bob

    const messageModel = new MessageModel(
      BigInt(1685216402734),
      aliceWallet.classicAddress,
      'This is a message'
    )

    // const path = `/Chats/${generateKey(20)}`
    const path = `/Chats/JrqfNImIw4XwsqF7sT3o/Messages/${generateKey(20)}`
    const binaryPath = convertHexToString(path)

    const api = new ApiService()
    const isReadOnly = false

    // ALICE USER
    const aliceUser: User = {
      publicKey: aliceWallet.publicKey,
      inputs: [],
      send: function (response: any): void {
        console.log(`ALICE RESPONSE: ${response.id}`)
        console.log(response)
        if (response && response.snapshot && response.snapshot.binary) {
          const decoded = decodeMetadata(
            response.snapshot.binary,
            response.snapshot.metadata
          )
          console.log(decoded)
        }
        return
      },
    }
    // BOB USER
    const bobUser: User = {
      publicKey: bobWallet.publicKey,
      inputs: [],
      send: function (response: any): void {
        console.log(`BOB RESPONSE: ${response.id}`)
        console.log(response)
        if (response && response.snapshot && response.snapshot.binary) {
          const decoded = decodeMetadata(
            response.snapshot.binary,
            response.snapshot.metadata
          )
          console.log(decoded)
        }
        return
      },
    }

    // POST - Alice
    const postRequest = prepareRequest(
      'alice-post-id',
      'one',
      'POST',
      path,
      messageModel.encode(),
      aliceWallet.publicKey,
      aliceWallet.privateKey,
      messageModel.getMetadata()
    )
    const postChatInputs = [Buffer.from(JSON.stringify(postRequest))]
    aliceUser.inputs = postChatInputs
    await api.handleRequest(aliceUser, postRequest, isReadOnly)

    // GET - Alice
    const aliceGetRequest = prepareRequest(
      'alice-get-id',
      'one',
      'GET',
      path,
      binaryPath,
      aliceWallet.publicKey,
      aliceWallet.privateKey
    )
    const aliceGetInputs = [Buffer.from(JSON.stringify(aliceGetRequest))]
    bobUser.inputs = aliceGetInputs
    await api.handleRequest(aliceUser, aliceGetRequest, isReadOnly)

    // GET - Bob
    const bobGetRequest = prepareRequest(
      'bob-get-id',
      'one',
      'GET',
      path,
      binaryPath,
      bobWallet.publicKey,
      bobWallet.privateKey
    )
    const bobGetInputs = [Buffer.from(JSON.stringify(bobGetRequest))]
    bobUser.inputs = bobGetInputs
    await api.handleRequest(bobUser, bobGetRequest, isReadOnly)

    // // PUT - Alice
    // chatModel.owners = [owner1, owner2]
    // const putRequest = prepareRequest(
    //   'alice-put-id',
    //   'one',
    //   'PUT',
    //   path,
    //   chatModel.encode(),
    //   aliceWallet.publicKey,
    //   aliceWallet.privateKey,
    //   chatModel.getMetadata()
    // )
    // const putChatInputs = [Buffer.from(JSON.stringify(putRequest))]
    // aliceUser.inputs = putChatInputs
    // await api.handleRequest(aliceUser, putRequest, isReadOnly)

    // // GET - Alice
    // const getRequest = prepareRequest(
    //   'alice-get-id',
    //   'one',
    //   'GET',
    //   path,
    //   binaryPath,
    //   aliceWallet.publicKey,
    //   aliceWallet.privateKey
    // )
    // const getChatInputs = [Buffer.from(JSON.stringify(getRequest))]
    // aliceUser.inputs = getChatInputs
    // await api.handleRequest(aliceUser, getRequest, isReadOnly)

    // DELETE - Alice
    // const deleteRequest = prepareRequest(
    //   'alice-delete-id',
    //   'one',
    //   'DELETE',
    //   path,
    //   chatModel.encode(),
    //   aliceWallet.publicKey,
    //   aliceWallet.privateKey,
    //   chatModel.getMetadata()
    // )
    // const deleteChatInputs = [Buffer.from(JSON.stringify(deleteRequest))]
    // aliceUser.inputs = deleteChatInputs
    // await api.handleRequest(aliceUser, deleteRequest, isReadOnly)
  })
})

// describe('end to end', () => {
//   let testContext: EvernodeTestContext
//   beforeAll(async () => {
//     testContext = await setupClient()
//   })

//   test('lmdb - post', async () => {
//     const model = new MessageModel(
//       BigInt(1685216402734),
//       'LWslHQUc7liAGYUryIhoRNPDbWucJZjj',
//       'This is a message'
//     )
//     const path = `/Messages/${testContext.alice.classicAddress}`
//     const publicKey = testContext.alice.publicKey
//     const privateKey = testContext.alice.privateKey
//     const request = prepareRequest(
//       '1',
//       'one',
//       'POST',
//       path,
//       model.encode(),
//       publicKey,
//       privateKey,
//       model.getMetadata()
//     )
//     const api = new ApiService()
//     const isReadOnly = true
//     const inputs = [Buffer.from(JSON.stringify(request))]
//     const user: User = {
//       publicKey: publicKey,
//       inputs: inputs,
//       send: function (response: any): void {
//         expect(response.id).toBe('1')
//         return
//       },
//     }
//     await api.handleRequest(user, request, isReadOnly)
//   })
//   test('lmdb get - failure', async () => {
//     const path = `/Messages/${testContext.alice.classicAddress}`
//     const publicKey = testContext.bob.publicKey
//     const privateKey = testContext.bob.privateKey
//     const binary = convertStringToHex(path)
//     const request = prepareRequest(
//       '1',
//       'one',
//       'GET',
//       path,
//       binary,
//       publicKey,
//       privateKey
//     )
//     const api = new ApiService()
//     const isReadOnly = true
//     const inputs = [Buffer.from(JSON.stringify(request))]
//     const user: User = {
//       publicKey: publicKey,
//       inputs: inputs,
//       send: function (response: any): void {
//         console.log(response)

//         expect(response.error).toBe('Invalid Permissions: Invalid Id')
//         return
//       },
//     }
//     await api.handleRequest(user, request, isReadOnly)
//   })
//   test('lmdb get - success', async () => {
//     const path = `/Messages/${testContext.alice.classicAddress}`
//     const publicKey = testContext.alice.publicKey
//     const privateKey = testContext.alice.privateKey
//     const binary = convertStringToHex(path)
//     const request = prepareRequest(
//       '1',
//       'one',
//       'GET',
//       path,
//       binary,
//       publicKey,
//       privateKey
//     )
//     const api = new ApiService()
//     const isReadOnly = true
//     const inputs = [Buffer.from(JSON.stringify(request))]
//     const user: User = {
//       publicKey: publicKey,
//       inputs: inputs,
//       send: function (response: any): void {
//         console.log(response)
//         const decodedMessage = lmdbConverter(
//           'Messages',
//           response.snapshot.binary
//         ) as MessageModel
//         expect(decodedMessage.updatedTime).toBe(1685216402734n)
//         expect(decodedMessage.updatedBy).toBe(
//           'LWslHQUc7liAGYUryIhoRNPDbWucJZjj'
//         )
//         expect(decodedMessage.message).toBe('This is a message')
//         return
//       },
//     }
//     await api.handleRequest(user, request, isReadOnly)
//   })
// })
