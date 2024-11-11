export interface CampaignCustomEventCountryRequestModel{
    campaignCustomEventCountryId: number | null;
    countryId: number| null;
    campaignCommunicationCustomEventId: number| null;
    parentCustomEventGuid: string | null;
}

export function CampaignCustomEventCountryRequestModelFactory() {
    const obj: CampaignCustomEventCountryRequestModel = {
        campaignCustomEventCountryId: null,
        countryId:  null,
        campaignCommunicationCustomEventId:   null,
        parentCustomEventGuid: ''
    }
    return obj
}