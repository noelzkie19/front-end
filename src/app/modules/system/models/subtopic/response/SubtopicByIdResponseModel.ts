import {SubtopicCurrencyModel, SubtopicDetailsModel, SubtopicLanguageModel, SubtopicTopicModel} from '../..';

export interface SubtopicByIdResponseModel {
	subtopicDetails: SubtopicDetailsModel;
	subtopicCurrencyList: Array<SubtopicCurrencyModel>;
	subtopicLanguageList: Array<SubtopicLanguageModel>;
	subtopicTopicList: Array<SubtopicTopicModel>;
}
