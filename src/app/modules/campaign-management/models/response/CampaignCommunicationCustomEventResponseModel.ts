export interface CampaignCommunicationCustomEventResponseModel{
    customEventName: string;
        campaignEventSettingId: number | null;
        currencyName: string;
        currencyId: number | null;
        countryName: string;
}

export function CampaignCommunicationCustomEventResponseModelFactory() {
    const obj: CampaignCommunicationCustomEventResponseModel = {
        customEventName: "",
        campaignEventSettingId:  null,
        currencyName:   "",
        currencyId:   null,
        countryName:   "",
    }
    return obj
}