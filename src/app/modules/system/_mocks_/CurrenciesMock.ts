import { CurrencyModel } from '../models/CurrencyModel'
export class CurrenciesMock {
  public static table: Array<CurrencyModel> = [
    {
      id: 1,
      name: 'RMB',
      status: 1,
    },
    {
      id: 2,
      name: 'VND',
      status: 1,
    },
    {
      id: 3,
      name: 'THB',
      status: 2,
    }
  ]
}
