import { RequestModel } from "..";

export interface CurrencyRequestModel extends RequestModel {
    currencyId?: number,
    currencyName: string,
    currencyCode: string
}