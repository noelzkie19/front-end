import { BaseModel } from "../../../user-management/models/BaseModel";

export interface SaveJourneyRequestModel extends BaseModel {
    journeyId: number,
    journeyName: string,
    journeyDescription: string,
    journeyCampaignIds: string
}