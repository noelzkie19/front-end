import { CurrencyRowsModel } from '../models'
export class CurrencyRowsMocks {
  public static table: Array<CurrencyRowsModel> = [
    {
      currencyId: 1,
      currencyName: 'RMB',
    },
    {
      currencyId: 2,
      currencyName: 'VND',
    },
    {
      currencyId: 3,
      currencyName: 'THB',
    }
  ]
}
