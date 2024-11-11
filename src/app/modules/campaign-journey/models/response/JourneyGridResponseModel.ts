import { JourneyGridModel } from "../JourneyGridModel";

export interface JourneyGridResponseModel {
    totalRecordCount: number,
    journeyGridModel: Array<JourneyGridModel>
}
