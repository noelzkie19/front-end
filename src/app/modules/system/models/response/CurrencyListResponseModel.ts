import { CurrencyConfigResponseModel } from './CurrencyConfigResponseModel';
export interface CurrencyListResponseModel {
    currencyList: Array<CurrencyConfigResponseModel>,
    recordCount: number
}