import { RemHistoryModel } from "./RemHistoryModel";

export interface RemHistoryListResponse {
    remHistoryList: Array<RemHistoryModel>,
    recordCount: number
}