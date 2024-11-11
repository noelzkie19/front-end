import {RequestModel, SubtopicLanguageModel} from '../..';
import {SubtopicCurrencyModel} from '../udt/SubtopicCurrencyModel';
import {SubtopicTopicModel} from '../udt/SubtopicTopicModel';

export interface SubtopicNewRequestModel extends RequestModel {
	subtopicId: number;
	subtopicName: string;
	isActive: boolean;
	position: number;
	subtopicTopicList: Array<SubtopicTopicModel>;
	subtopicLanguageList: Array<SubtopicLanguageModel>;
	subtopicCurrencyList: Array<SubtopicCurrencyModel>;
}
