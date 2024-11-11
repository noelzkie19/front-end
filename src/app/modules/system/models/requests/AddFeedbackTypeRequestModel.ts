import { RequestModel } from './../RequestModel';
import { FeedBackTypePostModel } from './FeedBackTypePostModel';
export interface AddFeedbackTypeRequestModel extends RequestModel {
    codeListId: number,
    codeListStatus: string,
    feedbackType: Array<FeedBackTypePostModel>
}