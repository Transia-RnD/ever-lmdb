// import { BaseModel, Metadata } from '../../dist/npm/src/models'
import {
  decodeModel,
  hexToUInt8,
  hexToUInt32,
  hexToUInt64,
  hexToUInt224,
  hexToVarString,
  hexToXRPAddress,
} from '../../dist/npm/src/util/decode'
import {
  UInt64,
  UInt8,
  VarString,
  XRPAddress,
} from '../../dist/npm/src/util/types'

describe('UInt8', () => {
  test('multiple fields', () => {
    const SampleModel = class extends BaseModel {
      updatedTime: UInt64
      updatedBy: VarString
      owner: XRPAddress
      message: VarString

      constructor(
        updatedTime: UInt64,
        updatedBy: VarString,
        owner: XRPAddress,
        message: VarString
      ) {
        super()
        this.updatedTime = updatedTime
        this.updatedBy = updatedBy
        this.owner = owner
        this.message = message
      }

      getMetadata(): Metadata {
        return [
          { field: 'updatedTime', type: 'uint64' },
          { field: 'updatedBy', type: 'varString', maxStringLength: 32 },
          { field: 'owner', type: 'xrpAddress' },
          { field: 'message', type: 'varString', maxStringLength: 250 },
        ]
      }
    }

    const some = new SampleModel(
      BigInt(1685216402734),
      'LWslHQUc7liAGYUryIhoRNPDbWucJZjj',
      'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
      'This is a message'
    )
    console.log(some.encode())

    const sampleModelDecoded = decodeModel(some.encode(), SampleModel)
    console.log(sampleModelDecoded)

    const updateTime = BigInt(1685216402734)
    const updateBy = 'LWslHQUc7liAGYUryIhoRNPDbWucJZjj'
    const owner = 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh'
    const message = 'This is a message'
    const fundRaiseGoalInDrops = BigInt('1000000000')

    expect(sampleModelDecoded.updatedTime).toBe(updateTime)
    expect(sampleModelDecoded.updatedBy).toBe(updateBy)
    expect(sampleModelDecoded.owner).toBe(owner)
    expect(sampleModelDecoded.message).toBe(message)
  })
})
