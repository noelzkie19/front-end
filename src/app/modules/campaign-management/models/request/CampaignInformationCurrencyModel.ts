export interface CampaignInformationCurrencyModel {
    campaignInformationCurrencyId : number,
    campaignInformationId: number,
    currencyId : number,
}


export function CampaignInformationCurrencyModelFactory() {
    const obj: CampaignInformationCurrencyModel = {
            campaignInformationCurrencyId : 0,
            campaignInformationId: 0,
            currencyId : 0,
    }
    return obj
}