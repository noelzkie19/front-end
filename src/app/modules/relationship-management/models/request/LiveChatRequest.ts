export interface LiveChatRequest {
	liveChatId: number;
	remProfileId?: number;
	agentID?: string;
	groupID?: string;
	groupName?: string;
	createdBy?: number;
	updatedBy?: number;
}
