import { RequestModel } from "../RequestModel";
import { TopicLanguageTranslationResponseModel } from "./TopicLanguageTranslationResponseModel";
import { TopicResponseModel } from "./TopicResponseModel";

export interface TopicResponseListModel extends RequestModel {
    topicList: Array<TopicResponseModel>,
    recordCount: number,
    topicLanguageList: Array<TopicLanguageTranslationResponseModel>
}