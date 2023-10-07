import { sign } from '@transia/ripple-keypairs/dist'
import { deriveAddress } from '@transia/xrpl'

export interface Auth {
  uid: string
  signature: string
  pk: string
}

export interface Request {
  id: string // of request not id of object
  type: string // db | custom (functions)
  database: string // "one"
  method: string
  path: string
  metadata?: Record<string, any>
  binary?: string | null // signed data(write) or path(read)
  auth?: Auth
}

export interface User {
  publicKey: string
  inputs: Buffer[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  send: (response: any) => void
}

export interface Users {
  users: User[]
}

export function prepareRequest(
  id: string,
  type: string,
  database: string,
  method: string,
  path: string,
  binary: string,
  publicKey: string,
  privateKey: string,
  metadata?: Record<string, any>
) {
  return {
    id: id,
    type: type,
    database: database,
    method: method,
    path: path,
    metadata: metadata,
    binary: binary,
    auth: {
      uid: deriveAddress(publicKey),
      signature: sign(binary, privateKey),
      pk: publicKey,
    },
  } as Request
}
