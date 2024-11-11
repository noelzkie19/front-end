export interface MessageTypeListResponse {
	messageTypeId: number | undefined;
	messageTypeName: string;
	messageTypeStatus: boolean;
	position: number;
	channelTypeId: string;
	messageChannelTypeName: string;
	messageGroupId: string;
	messageGroupName: string;
}
