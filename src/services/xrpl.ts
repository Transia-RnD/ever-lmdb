import { Client, Wallet } from '@transia/xrpl'
import { EventEmitter } from './event'

interface DefaultValues {
  registryAddress: string
  rippledServer: string
  api?: string | null
}
const defaults: DefaultValues = {
  registryAddress: '',
  rippledServer: 'wss://hooks-testnet-v2.xrpl-labs.com',
  api: null,
}

export class XrplAccount {
  #events = new EventEmitter()
  #subscribed = false
  // #txStreamHandler
  #api: Client
  wallet: Wallet
  address: string
  secret?: string | null

  #maintainConnection = false
  #rippledServer: string = null
  ledgerIndex?: number | null

  constructor(
    address: string,
    options: Record<string, any>,
    secret?: string | null
  ) {
    this.#api = options.api || defaults.api
    this.#rippledServer = options.rippledServer || defaults.rippledServer

    if (!this.#api) throw 'XrplAccount: api not specified.'

    this.address = address

    this.secret = secret
    if (this.secret) this.wallet = Wallet.fromSeed(this.secret)

    // this.#txStreamHandler = (eventName: string, tx:, error) => {
    //   this.#events.emit(eventName, tx, error)
    // }
  }

  async #initXrplClient(xrplClientOptions = {}) {
    if (this.#api) {
      // If the client already exists, clean it up.
      this.#api.removeAllListeners() // Remove existing event listeners to avoid them getting called from the old client object.
      await this.#api.disconnect()
      this.#api = null
    }

    this.#api = new Client(this.#rippledServer, xrplClientOptions)

    this.#api.on('error', (errorCode: number, errorMessage: string) => {
      console.log(errorCode + ': ' + errorMessage)
    })

    this.#api.on('disconnected', (code: number) => {
      if (this.#maintainConnection) {
        console.log(
          `Connection failure for ${this.#rippledServer} (code:${code})`
        )
        console.log('Reinitializing xrpl client.')
        this.#initXrplClient().then(() => this.#connect(true))
      }
    })
  }

  async #connect(reconnect = false) {
    if (reconnect) {
      let attempts = 0
      while (this.#maintainConnection) {
        // Keep attempting until consumer calls disconnect() manually.
        console.log(`Reconnection attempt ${++attempts}`)
        try {
          await this.#api.connect()
          break
        } catch {
          if (this.#maintainConnection) {
            const delaySec = 2 * attempts // Retry with backoff delay.
            console.log(
              `Attempt ${attempts} failed. Retrying in ${delaySec}s...`
            )
            await new Promise((resolve) => setTimeout(resolve, delaySec * 1000))
          }
        }
      }
    } else {
      // Single attempt and throw error. Used for initial connect() call.
      await this.#api.connect()
    }

    // After connection established, check again whether maintainConnections has become false.
    // This is in case the consumer has called disconnect() while connection is being established.
    if (this.#maintainConnection) {
      this.ledgerIndex = await this.#api.getLedgerIndex()
      // this.#subscribeToStream('ledger')

      // Re-subscribe to existing account address subscriptions (in case this is a reconnect)
      // if (this.#addressSubscriptions.length > 0)
      //   await this.#client.request({
      //     command: 'subscribe',
      //     accounts: this.#addressSubscriptions.map((s) => s.address),
      //   })
    } else {
      await this.disconnect()
    }
  }

  on(event: any, handler: any) {
    this.#events.on(event, handler)
  }

  once(event: any, handler: any) {
    this.#events.once(event, handler)
  }

  off(event: any, handler?: any | null) {
    this.#events.off(event, handler)
  }

  async connect() {
    if (this.#maintainConnection) return

    this.#maintainConnection = true
    await this.#connect()
  }

  async disconnect() {
    this.#maintainConnection = false

    if (this.#api.isConnected()) {
      await this.#api.disconnect().catch(console.error)
    }
  }

  async subscribe() {
    if (this.#subscribed) return

    await this.#api.submit(this.address)

    this.#subscribed = true
  }

  async unsubscribe() {
    if (!this.#subscribed) return

    await this.#api.submit(this.address)
    this.#subscribed = false
  }
}
