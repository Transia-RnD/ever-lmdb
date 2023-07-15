import { Dbi, Env } from 'node-lmdb'

export class LMDBDatabase {
  env: Env
  db: Dbi
  characters: string
  dbCollection: string
  openConnections: number

  constructor(dbCollection: string) {
    this.characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    this.dbCollection = dbCollection
    this.openConnections = 0
  }

  open() {
    // Make sure only one connection is open at a time.
    // If a connection is already open increase the connection count.
    // This guarantees only one connection is open even if open() is called before closing the previous connections.
    if (this.openConnections <= 0) {
      // console.log('OPEN')
      // node-lmdb
      this.env = new Env()
      this.env.open({
        path: 'mydata',
        mapSize: 2 * 1024 * 1024 * 1024, // maximum database size
        maxDbs: 3,
      })
      // console.log(`OPENING COLLECTION: ${this.dbCollection}`)
      this.db = this.env.openDbi({
        name: this.dbCollection,
        create: true, // will create if database did not exist
      })
      this.openConnections = 1
    } else {
      // console.log('OPEN - ELSE')
    }
    this.openConnections++
  }

  close() {
    // Only close the connection for the last open connection.
    // Otherwise keep decreasing until connection count is 1.
    // This prevents closing the connection even if close() is called while db is used by another open session.
    if (this.openConnections <= 1) {
      // console.log('CLOSE')
      if (this.db && this.env) {
        this.db.close()
        this.env.close()
        this.db = null
        this.env = null
        this.openConnections = 0
      }
    } else {
      // console.log('CLOSE - ELSE')
    }
    this.openConnections--
  }

  create(key: string, buffer: Buffer) {
    if (!this.env) throw 'Env connection is not open.'
    if (!this.db) throw 'Database connection is not open.'

    // node-lmdb
    // console.log('LMDB CREATE')
    const txn = this.env.beginTxn()
    txn.putBinary(this.db, key, buffer)
    txn.commit()
    return key
  }

  async get(key: string) {
    if (!this.env) throw 'Env connection is not open.'
    if (!this.db) throw 'Database connection is not open.'

    // node-lmdb
    // console.log('LMDB GET')
    const txn = this.env.beginTxn()
    const data = txn.getBinary(this.db, key)
    txn.commit()

    if (!data) {
      throw Error('No Data')
    }
    return data.toString()
  }

  async update(key: string, buffer: Buffer) {
    if (!this.env) throw 'Env connection is not open.'
    if (!this.db) throw 'Database connection is not open.'

    // node-lmdb
    // console.log('LMDB UPDATE')
    const txn = this.env.beginTxn()
    txn.putBinary(this.db, key, buffer)
    txn.commit()

    if (!buffer) {
      // throw Error('No Data');
      return {
        error: 'No Data',
        status: 'error',
        type: 'error',
      }
    }
    // console.log('LMDB UPDATE')
    return true
  }

  async delete(key: string) {
    if (!this.env) throw 'Env connection is not open.'
    if (!this.db) throw 'Database connection is not open.'

    // node-lmdb
    // console.log('LMDB DELETE')
    const txn = this.env.beginTxn()
    txn.del(this.db, key)
    txn.commit()
    return true
  }

  generateKey(length: number) {
    let result = ' '
    const charactersLength = this.characters.length
    for (let i = 0; i < length; i++) {
      result += this.characters.charAt(
        Math.floor(Math.random() * charactersLength)
      )
    }
    return result
  }
}
