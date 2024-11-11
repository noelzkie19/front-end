import { FeedbackAnswerModel } from '../FeedbackAnswerModel';
import { RequestModel } from './../RequestModel';

export interface AddFeedbackAnswerRequestModel extends RequestModel {
    codeListId: number,
    codeListStatus: string,
    feedbackAnswers: Array<FeedbackAnswerModel>
}