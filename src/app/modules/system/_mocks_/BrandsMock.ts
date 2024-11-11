import { BrandModel } from '../models/BrandModel'
import { CurrenciesMock } from './CurrenciesMock'
export class BrandsMock {
  public static table: Array<BrandModel> = [
		{
			id: 1,
			name: 'M88',
			status: 1,
			currencies: CurrenciesMock.table,
			createStatus: 1
		},
		{
			id: 2,
			name: 'H8',
			status: 1,
			currencies: CurrenciesMock.table,
			createStatus: 1
		},
		{
			id: 3,
			name: 'CLUB8',
			status: 2,
			currencies: CurrenciesMock.table,
			createStatus: 1
		}
	]
}
