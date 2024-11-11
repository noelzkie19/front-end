import { RequestModel } from "../RequestModel";

export interface FeedbackTypeFilterModel extends RequestModel {
    feedbackTypeName: string | null,
    feedbackTypeStatus: string | null
}