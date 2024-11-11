import { CampaignDetailsModel } from "../CampaignDetailsModel";
import { JourneyDetailsModel } from "../JourneyDetailsModel";

export interface JourneyDetailsResponseModel {
    journeyDetailsModel: JourneyDetailsModel,
    journeyCampaignDetailsModel: Array<CampaignDetailsModel>
}
