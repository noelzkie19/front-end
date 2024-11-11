export interface CampaignCommunicationCustomEventRequestModel {
    campaignCommunicationCustomEventId: number| null;
    currencyId: number| null;
    campaignEventSettingId: number| null;
    campaignCommunicationSettingId: number| null;
    customEventGuid: string | null
}
export function CampaignCommunicationCustomEventRequestModelFactory() {
    const obj:CampaignCommunicationCustomEventRequestModel = {
        campaignCommunicationCustomEventId: null,
        currencyId:  null,
        campaignEventSettingId:   null,
        campaignCommunicationSettingId: null,
        customEventGuid: null
    }
    return obj
}