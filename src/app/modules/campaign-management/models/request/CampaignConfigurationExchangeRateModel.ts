export interface CampaignConfigurationExchangeRateModel{
    campaignConfigurationId : number  | undefined,
    campaignInformationCurrencyId : number | undefined,
    exchangeRate: number | undefined | string,
    campaignConfigurationExchangeRateId: number | undefined,
    currencyId: number | undefined,
    currencyName: string | undefined,
}
export function CampaignConfigurationExchangeRateModelFactory() {
    const obj: CampaignConfigurationExchangeRateModel = {
            campaignConfigurationId : 0,
            campaignInformationCurrencyId : 0,
            exchangeRate: 0,
            campaignConfigurationExchangeRateId: 0,
            currencyId: 0,
            currencyName: undefined
    }
    return obj
}