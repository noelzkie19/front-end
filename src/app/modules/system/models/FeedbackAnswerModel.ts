import { FeedbackAnswerCategoryModel } from "./FeedbackAnswerCategoryModel";

export interface FeedbackAnswerModel {
    feedbackAnswerId: number,
    position: number,
    feedbackAnswerName: string,
    feedbackAnswerStatus: boolean,
    feedbackCategoryId: number,
    feedbackCategoryName: string,
    createdBy?: number,
    updateBy?: number,
    feedbackAnswerCategories: Array<FeedbackAnswerCategoryModel>
}