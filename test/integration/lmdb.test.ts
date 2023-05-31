import { Wallet, convertStringToHex } from 'xrpl'
import fs from 'fs'
import path from 'path'
import { ApiService, prepareRequest } from '../../dist/npm/src/services/api'
import { User } from '../../dist/npm/src/services/types'
import { MessageModel } from '../../dist/npm/src/models'
import { decodeModel } from '../../dist/npm/src/util/decode'

export function readFile(filename: string): string {
  const jsonString = fs.readFileSync(
    path.resolve(__dirname, `../fixtures/${filename}`)
  )
  return jsonString.toString()
}

function lmdbConverter(collectionName: string, binary: string) {
  switch (collectionName) {
    case 'Messages':
      return decodeModel(binary, MessageModel)
    default:
      break
  }
}

export async function setupClient(): Promise<XrplIntegrationTestContext> {
  const config = JSON.parse(readFile('../fixtures/config.json'))
  const currency = 'USD'

  const context: XrplIntegrationTestContext = {
    notactive: Wallet.fromSeed(config.notactive.seed),
    master: Wallet.fromSeed(config.master.seed),
    gw: Wallet.fromSeed(config.gw.seed),
    ic: IC.gw(currency, Wallet.fromSeed(config.gw.seed).classicAddress),
    alice: Wallet.fromSeed(config.alice.seed),
    bob: Wallet.fromSeed(config.bob.seed),
    carol: Wallet.fromSeed(config.carol.seed),
  }
  return context
}

export interface XrplIntegrationTestContext {
  notactive: Wallet
  master: Wallet
  gw: Wallet
  ic: IC
  alice: Wallet
  bob: Wallet
  carol: Wallet
}

export class IC {
  issuer: string | undefined
  currency: string | undefined
  value: number | undefined
  amount: Record<string, string | number> | undefined

  static gw(name: string, gw: string): IC {
    // TODO: symbolToHex(name);
    return new IC(gw, name, 0)
  }

  constructor(issuer: string, currency: string, value: number) {
    this.issuer = issuer
    this.currency = currency
    this.value = value
    this.amount = {
      issuer: this.issuer,
      currency: this.currency,
      value: String(this.value),
    }
  }

  set(value: number): IC {
    this.value = value
    this.amount = {
      issuer: this.issuer as string,
      currency: this.currency as string,
      value: String(this.value),
    }
    return this
  }
}

describe('end to end', () => {
  let testContext: XrplIntegrationTestContext
  beforeAll(async () => {
    testContext = await setupClient()
  })

  test('lmdb - post', async () => {
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
      'one',
      'POST',
      path,
      model.encode(),
      publicKey,
      privateKey,
      model.getMetadata()
    )
    const api = new ApiService()
    const isReadOnly = true
    const inputs = [Buffer.from(JSON.stringify(request))]
    const user: User = {
      publicKey: publicKey,
      inputs: inputs,
      send: function (response: any): void {
        expect(response.id).toBe(
          '2F4D657373616765732F72776F746F514A3950625164485852386D6175764B437A4370775543327768745059'
        )
        return
      },
    }
    await api.handleRequest(user, request, isReadOnly)
  })
  test('lmdb get - failure', async () => {
    const path = `/Messages/${testContext.alice.classicAddress}`
    const publicKey = testContext.bob.publicKey
    const privateKey = testContext.bob.privateKey
    const binary = convertStringToHex(path)
    const request = prepareRequest(
      '1',
      'one',
      'GET',
      path,
      binary,
      publicKey,
      privateKey
    )
    const api = new ApiService()
    const isReadOnly = true
    const inputs = [Buffer.from(JSON.stringify(request))]
    const user: User = {
      publicKey: publicKey,
      inputs: inputs,
      send: function (response: any): void {
        console.log(response)

        expect(response.error).toBe('Invalid Permissions: Invalid Id')
        return
      },
    }
    await api.handleRequest(user, request, isReadOnly)
  })
  test('lmdb get - success', async () => {
    const path = `/Messages/${testContext.alice.classicAddress}`
    const publicKey = testContext.alice.publicKey
    const privateKey = testContext.alice.privateKey
    const binary = convertStringToHex(path)
    const request = prepareRequest(
      '1',
      'one',
      'GET',
      path,
      binary,
      publicKey,
      privateKey
    )
    const api = new ApiService()
    const isReadOnly = true
    const inputs = [Buffer.from(JSON.stringify(request))]
    const user: User = {
      publicKey: publicKey,
      inputs: inputs,
      send: function (response: any): void {
        console.log(response)
        const decodedMessage = lmdbConverter(
          'Messages',
          response.snapshot.binary
        ) as MessageModel
        expect(decodedMessage.updatedTime).toBe(1685216402734n)
        expect(decodedMessage.updatedBy).toBe(
          'LWslHQUc7liAGYUryIhoRNPDbWucJZjj'
        )
        expect(decodedMessage.message).toBe('This is a message')
        return
      },
    }
    await api.handleRequest(user, request, isReadOnly)
  })
})
