export interface User {
  publicKey: string
  inputs: Buffer[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  send: (response: any) => void
}

export interface Users {
  users: User[]
}
