export interface ContactDetailsSelectionRequest {
	contactDetailsId: number;
	messageTypeId: number;
	contactDetailsName: string;
	contactDetailValue: string;
	livePersonId?: number;
	liveEngagementId?: string;
	liveAgentId?: string;
	liveSkillId?: string;
	liveSkillName?: string;
	liveSection?: string;
	liveChatId?: number;
	liveChatAgentId?: string;
	liveChatGroupId?: string;
	liveChatGroupName?: string;
}
