import { RequestModel } from './../RequestModel';
import { FeedbackCategoryModel } from './../FeedbackCategoryModel';

export interface AddFeedbackCategoryRequestModel extends RequestModel {
    codeListId: number,
    codeListStatus: string,
    feedbackCategories: Array<FeedbackCategoryModel>
}