export interface RemProfileModel {
	remProfileID: number | null;
	remProfileName: string;
	agentId: number | null;
	agentName: string;
	pseudoNamePP: string;
	onlineStatusId: number | null;
	onlineStatus: string;
	agentConfigStatusId: number | null;
	agentConfigStatus: string;
	scheduleTemplateSettingId: number | null;
	scheduleTemplateSettingName: string;
	createdBy: number | null;
	updatedBy: number | null;
	createdDate: string | null;
	updatedDate: string | null;
}
