import { CountryModel } from "./CountryModel";

export interface CountryListModel {
    countryList: Array<CountryModel>,
    recordCount: number
}