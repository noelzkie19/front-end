export interface BroadcastConfigurationModel {
	broadcastConfigurationId: number;
	broadcastId: number;
	broadcastName: string;
	broadcastDate: Date;
	broadcastStatusId: number;
	broadcastStatus?: string ;
	messageTypeId: number;
	attachment: string;
	message: string;
	createdDate:Date;
	botId: number;
}