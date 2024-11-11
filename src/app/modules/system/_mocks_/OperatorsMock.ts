import { BrandsMock } from '../_mocks_/BrandsMock'
import { OperatorModel } from '../models/OperatorModel'
export class OperatorsMock {
  public static table: Array<OperatorModel> = [
    {
      operatorId: 1,
      operatorName: 'Bigcat',
      operatorStatus: 1,
      brands: BrandsMock.table,
      createdBy : 1
    },
    {
      operatorId: 2,
      operatorName: 'Medium Cat',
      operatorStatus: 1,
      brands: BrandsMock.table,
      createdBy : 1

    },
    {
      operatorId: 3,
      operatorName: 'Large Cat',
      operatorStatus: 2,
      brands: BrandsMock.table,
      createdBy : 1
    },
    {
      operatorId: 4,
      operatorName: 'Large Cat 4',
      operatorStatus: 2,
      brands: BrandsMock.table,
      createdBy : 1
    },
    {
      operatorId: 5,
      operatorName: 'Large Cat 5',
      operatorStatus: 2,
      brands: BrandsMock.table,
      createdBy : 1
    },
  ]
}
