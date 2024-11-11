export interface RemAgentProfileRequest {
	remProfileId: number;
	remProfileName: string;
	agentId?: number;
	pseudoNamePP: string;
	scheduleTemplateSettingId?: number;
	onlineStatusId?: number;
	agentConfigStatusId?: number;
	createdBy?: number;
	createdDate?: string;
	updatedBy?: number;
	updatedDate?: string;
	contactDetailsId?: number;
}
