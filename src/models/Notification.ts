import {
  BaseModel,
  Metadata,
  UInt8,
  UInt64,
  VarString,
} from '@transia/hooks-toolkit/dist/npm/src/libs/binary-models'

export class NotificationModel extends BaseModel {
  active: UInt8
  deleted: UInt8
  createdTime: UInt64
  createdBy: VarString
  updatedTime: UInt64
  updatedBy: VarString
  isType: VarString
  status: VarString
  title: VarString
  message: VarString
  objectId: VarString
  objectType: VarString

  constructor(
    active: UInt8,
    deleted: UInt8,
    createdTime: UInt64,
    createdBy: VarString,
    updatedTime: UInt64,
    updatedBy: VarString,
    isType: VarString,
    status: VarString,
    title: VarString,
    message: VarString,
    objectId: VarString,
    objectType: VarString
  ) {
    super()
    this.active = active
    this.deleted = deleted
    this.createdTime = createdTime
    this.createdBy = createdBy
    this.updatedTime = updatedTime
    this.updatedBy = updatedBy
    this.isType = isType
    this.status = status
    this.title = title
    this.message = message
    this.objectId = objectId
    this.objectType = objectType
  }

  getMetadata(): Metadata {
    return [
      { field: 'active', type: 'uint8' },
      { field: 'deleted', type: 'uint8' },
      { field: 'createdTime', type: 'uint64' },
      { field: 'createdBy', type: 'varString', maxStringLength: 34 },
      { field: 'updatedTime', type: 'uint64' },
      { field: 'updatedBy', type: 'varString', maxStringLength: 34 },
      { field: 'isType', type: 'varString', maxStringLength: 20 },
      { field: 'status', type: 'varString', maxStringLength: 20 },
      { field: 'title', type: 'varString', maxStringLength: 100 },
      { field: 'message', type: 'varString', maxStringLength: 250 },
      { field: 'objectId', type: 'varString', maxStringLength: 34 },
      { field: 'objectType', type: 'varString', maxStringLength: 20 },
    ]
  }

  toJSON() {
    return {
      active: this.active,
      deleted: this.deleted,
      createdTime: this.createdTime,
      createdBy: this.createdBy,
      updatedTime: this.updatedTime,
      updatedBy: this.updatedBy,
      isType: this.isType,
      status: this.status,
      title: this.title,
      message: this.message,
      objectId: this.objectId,
      objectType: this.objectType,
    }
  }
}
