import { MessageModel } from '../../dist/npm/src/models'
import { decodeModel } from '../../dist/npm/src/util/decode'

describe('UInt8', () => {
  test('multiple fields', () => {
    const some = new MessageModel(
      BigInt(1685216402734),
      'LWslHQUc7liAGYUryIhoRNPDbWucJZjj',
      'This is a message'
    )
    const sampleModelDecoded = decodeModel(some.encode(), MessageModel)
    const updateTime = BigInt(1685216402734)
    const updateBy = 'LWslHQUc7liAGYUryIhoRNPDbWucJZjj'
    const message = 'This is a message'
    expect(sampleModelDecoded.updatedTime).toBe(updateTime)
    expect(sampleModelDecoded.updatedBy).toBe(updateBy)
    expect(sampleModelDecoded.message).toBe(message)
  })
})
