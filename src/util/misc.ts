const characters =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export function generateKey(length: number) {
  let result = ' '
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export function HexToUint8Array(key: Buffer) {
  return key
    .reduce(
      (accumulator, value) => accumulator + value.toString(16).padStart(2, '0'),
      ''
    )
    .toUpperCase()
}

export function Uint8ArrayToHex(hex: string): Uint8Array {
  const result = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    result[i / 2] = parseInt(hex.substr(i, 2), 16)
  }
  return result
}
