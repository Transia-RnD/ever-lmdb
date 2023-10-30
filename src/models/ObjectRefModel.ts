import {
  BaseModel,
  Metadata,
  VarString,
  UInt64,
} from '@transia/hooks-toolkit/dist/npm/src/libs/binary-models'

export class ObjectRefModel extends BaseModel {
  ref: VarString
  updatedTime: UInt64
  updatedBy: VarString

  constructor(ref: VarString, updatedTime: UInt64, updatedBy: VarString) {
    super()
    this.ref = ref
    this.updatedTime = updatedTime
    this.updatedBy = updatedBy
  }

  getMetadata(): Metadata {
    return [
      { field: 'ref', type: 'varString', maxStringLength: 32 },
      { field: 'updatedTime', type: 'uint64' },
      { field: 'updatedBy', type: 'varString', maxStringLength: 34 },
    ]
  }
}
