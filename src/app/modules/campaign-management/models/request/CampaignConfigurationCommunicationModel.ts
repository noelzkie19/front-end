export interface CampaignConfigurationCommunicationModel {
    campaignCommunicationSettingId: number | null;
    caseType: string| null;
    campaignConfigurationId: number | null;
    messageType: string | undefined;
    messageGroupId: number | null;
    interval: string| null;
    customEventId: number | null;
    messageStatus: string;
    topic: string;
    subTopic: string;
    communicationContent: string;
    createdDate: Date | string | null;
    createdBy: number| null;
    updatedBy: number| null;
    updatedDate: Date | string | null;
}

export function CampaignConfigurationCommunicationModelFactory() {
    const obj: CampaignConfigurationCommunicationModel = {
        campaignCommunicationSettingId: null,
        caseType:  "",
        campaignConfigurationId:   null,
        messageType: "",
        messageGroupId: null,
        interval: "",
        customEventId:   null,
        messageStatus: "",
        topic: "",
        subTopic: "",
        communicationContent: "",
        createdDate:   null,
        createdBy: null,
        updatedBy: null,
        updatedDate:  null,
    }
    return obj
}