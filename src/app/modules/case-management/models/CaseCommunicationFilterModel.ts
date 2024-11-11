import {PaginationModel} from '../../../shared-models/PaginationModel';
import {RequestModel} from '../../system/models';

export interface CaseCommunicationFilterModel {
	brandId: number;
	caseTypeIds: number;
	messageTypeIds?: string | null;
	vipLevelIds?: string | null;
	dateByFrom?: string | null;
	dateByTo?: string | null;
	caseStatusIds?: string | null;
	communicationOwners?: string | null;
	externalId?: string | null;
	playerIds?: string | null;
	usernames?: string | null;
	caseId?: string | null;
	communicationId?: string | null;
	topicLanguageIds?: string | null;
	subtopicLanguageIds?: string | null;
	duration: number;
	campaignId?: number | null;
	communicationOwnerTeamId?: number| null;
	currencyIds?: string | null;
	subject?: string | null;
	notes?: string | null;
	dateBy?: number | null;
	isLastSkillAbandonedQueue?: string | null;
	isLastAgentAbandonedAssigned?: string | null;
}

export interface ICaseCommunicationFilterModel extends CaseCommunicationFilterModel, PaginationModel, RequestModel {}
