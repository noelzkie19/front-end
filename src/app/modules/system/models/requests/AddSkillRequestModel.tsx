import {BaseRequest} from '../../../../shared-models/BaseRequest';

export interface AddSkillRequestModel extends BaseRequest {
	id: number | null;
	brandId: number;
	licenseId: string;
	skillId: string;
	skillName: string;
	messageTypeId: number;
	isActive: boolean;
	mlabPlayerId: number | null;
    agentUserId: number | null;
    teamId: number | null;
    topicId: number | null;
    subtopicId: number | null;
}
