import { Logging, Log, Entry } from '@google-cloud/logging'
import path from 'path'

export class LogEmitter {
  #log: Log
  #name: string
  #type: string
  #metadata: Record<string, any>

  constructor(name: string, type: string) {
    this.#name = name
    this.#type = type
    const keyFilename = path.join(process.cwd(), 'credentials.json')
    try {
      const logging = new Logging({ projectId: 'evernode-prod', keyFilename })
      this.#log = logging.log(this.#name)
    } catch (error) {
      console.log(error)
      // pass
    }
    this.#metadata = {
      resource: { type: 'global' },
    }
  }

  info(message: string) {
    const metadata = {
      ...this.#metadata,
      severity: 'INFO',
    }
    this.write(message, metadata)
  }

  debug(message: string) {
    const metadata = {
      ...this.#metadata,
      severity: 'DEBUG',
    }
    this.write(message, metadata)
  }

  async warn(message: string) {
    const metadata = {
      ...this.#metadata,
      severity: 'WARNING',
    }
    this.write(message, metadata)
  }

  error(message: string) {
    const metadata = {
      ...this.#metadata,
      severity: 'ERROR',
    }
    this.write(message, metadata)
  }

  critical(message: string) {
    const metadata = {
      ...this.#metadata,
      severity: 'CRITICAL',
    }
    this.write(message, metadata)
  }

  write(message: string, metadata: Record<string, any>) {
    if (!this.#log) {
      switch (metadata.severity) {
        case 'INFO':
          console.info(message)
          break
        case 'DEBUG':
          console.debug(message)
          break
        case 'WARNING':
          console.warn(message)
          break
        case 'ERROR':
          console.error(message)
          break
        case 'CRITICAL':
          console.error(message)
          break
        default:
          console.log(message)
          break
      }
      return
    }
    const entry = this.#log.entry(metadata, {
      message: message,
      type: this.#type,
    }) as Entry
    // await this.#log.write(entry)
    this.#log.write(entry, (error, response) => {
      if (!error) {
        // The log entry was written.
        // console.log(response)
        // console.log(`Logged: ${entry.data.message}`)
        return
      }
      if (response) {
        return
      }
      // console.error(error)
    })
  }
}
