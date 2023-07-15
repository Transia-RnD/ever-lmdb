import {
  BaseModel,
  Metadata,
  XRPAddress,
} from '@transia/hooks-toolkit/dist/npm/src/libs/binary-models'

export class OwnerModel extends BaseModel {
  static getMetadata(): Metadata<BaseModel> {
    return [{ field: 'account', type: 'xrpAddress' }]
  }
  account: XRPAddress

  constructor(account: XRPAddress) {
    super()
    this.account = account
  }

  getMetadata(): Metadata {
    return [{ field: 'account', type: 'xrpAddress' }]
  }
}
