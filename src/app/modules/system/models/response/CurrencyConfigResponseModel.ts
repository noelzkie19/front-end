export interface CurrencyConfigResponseModel {
    currencyId?: number,
    currencyName: string,
    currencyCode: string,
    isComplete?: boolean
    status?: number,
    iCoreId?: number | null,
}