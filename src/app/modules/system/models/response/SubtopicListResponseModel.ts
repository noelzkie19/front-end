import { SubTopicLanguageTranslationResponseModel } from "./SubTopicLanguageTranslationResponseModel";
import { SubtopicUdtResponseModel } from "./SubtopicUdtResponseModel";

export interface SubtopicListResponseModel{
    subtopicList : Array<SubtopicUdtResponseModel>,
    recordCount: number;
    subtopicLanguageList: Array<SubTopicLanguageTranslationResponseModel>
}
