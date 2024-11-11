export interface GoalTypeCommunicationRecordListResponseModel {
	goalTypeCommunicationRecordId: number;
	goalTypeName: string | null;
	goalTypeId: number;
	campaignSettingId: number;
	messageTypeId: number;
	messageStatusId: number;
	goalTypeDataSourceId: number;
	goalTypePeriodId: number;
	intervalRelationalOperatorId: number;
	intervalSourceId: number;
	intervalSourceGoalTypeId: number;
	intervalNumber?: number;
	createdBy?: number;
	createdDate: string | null;
	updatedBy?: number;
	updatedDate: string | null;
}
