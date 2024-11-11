export interface LivePersonRequest {
	livePersonId: number;
	remProfileId?: number;
	engagementID?: string;
	agentID?: string;
	skillID?: string;
	skillName?: string;
	section?: string;
	createdBy?: number;
	updatedBy?: number;
}
