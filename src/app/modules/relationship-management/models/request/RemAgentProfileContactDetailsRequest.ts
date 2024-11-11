export interface RemAgentProfileContactDetailsRequest {
	remContactDetailsId: number;
	remProfileId?: number;
	messageTypeId?: string;
	contactDetailValue?: string;
	createdBy?: number;
	updatedBy?: number;
}
