import {
  BaseModel,
  Metadata,
  XRPAddress,
} from '@transia/hooks-toolkit/dist/npm/src/libs/binary-models'
import { OwnerModel } from './OwnerModel'

export class ChatModel extends BaseModel {
  owners: OwnerModel[]
  createdBy: XRPAddress

  constructor(createdBy: XRPAddress, owners: OwnerModel[]) {
    super()
    this.createdBy = createdBy
    this.owners = owners
  }

  getMetadata(): Metadata {
    return [
      { field: 'createdBy', type: 'xrpAddress' },
      {
        field: 'owners',
        type: 'varModelArray',
        modelClass: OwnerModel,
        metadata: OwnerModel.getMetadata(),
        maxArrayLength: 8,
      },
    ]
  }
}
