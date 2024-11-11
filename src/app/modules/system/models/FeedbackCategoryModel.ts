import { FeedbackCategoryTypeModel } from ".";
export interface FeedbackCategoryModel {
    feedbackCategoryId: number,
    feedbackCategoryName: string,
    feedbackCategoryStatus: boolean,
    feedbackTypeId: number,
    feedbackTypeName: string,
    position: number,
    feedbackCategoryTypes: Array<FeedbackCategoryTypeModel>
}