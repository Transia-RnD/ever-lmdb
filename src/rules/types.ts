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

export interface Response {
  id?: string
  snapshot?: Record<string, any>
  error?: string
}

export interface Rules {
  rules_version: string
  service: string
  [key: string]: any
}

export interface Rule {
  read: boolean | string
  create?: boolean | string
  update?: boolean | string
  delete?: boolean | string
  write?: boolean | string
  [key: string]: any
}
