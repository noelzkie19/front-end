import { RemProfileModel } from "./RemProfileModel";

export interface RemProfileListResponseModel {
    remProfileList: Array<RemProfileModel>,
    totalRecordCount: number
}