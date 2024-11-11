import { BrandModel } from './BrandModel'
export interface OperatorModel {
  operatorId: number
  operatorName: string
  operatorStatus: number
  brands: Array<BrandModel>
  createdBy: number
}