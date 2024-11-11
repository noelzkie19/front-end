import { PostChatSurveyListResponseModel } from "./PostChatSurveyListResponseModel"

export interface PostChatSurveyFilterResponseModel {
    postChatSurveyList: Array<PostChatSurveyListResponseModel>
    recordCount: number
}