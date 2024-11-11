export interface MessageTypePostRequest {
	id: number;
	messageTypeName: string;
	codeListId: number;
	position: number;
	isActive: boolean;
	channelTypeId: string;
	messageGroupId: string;
	createdBy?: number;
	updatedBy?: number;
	action?: string;
}
