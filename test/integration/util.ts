import { Wallet } from '@transia/xrpl'
import fs from 'fs'
import path from 'path'

export function readFile(filename: string): string {
  const jsonString = fs.readFileSync(
    path.resolve(__dirname, `../fixtures/${filename}`)
  )
  return jsonString.toString()
}

export async function setupClient(): Promise<EvernodeTestContext> {
  const config = JSON.parse(readFile('../fixtures/config.json'))
  const currency = 'USD'

  const context: EvernodeTestContext = {
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

export interface EvernodeTestContext {
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
