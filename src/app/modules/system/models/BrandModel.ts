import { CurrencyModel } from './CurrencyModel'
export interface BrandModel {
  id: number
  name: string
  status: number
  currencies: Array<CurrencyModel>,
  createStatus: number,
  brandStatus?: number
  brandId?: number
  teamOperatorId?: number
  brandName? : string 
}
