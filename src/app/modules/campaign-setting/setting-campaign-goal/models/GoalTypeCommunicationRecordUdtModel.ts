export interface GoalTypeCommunicationRecordUdtModel {
	goalTypeCommunicationRecordId: number;
	goalTypeId: number;
	goalTypeName: string;
	campaignSettingId: number;
	messageTypeId: number;
	messageStatusId: number;
	goalTypeDataSourceId: number;
	goalTypeDataSourceName: string;
	goalTypePeriodId: number;
	goalTypePeriodName: string;
	createdBy: number;
	updatedBy: number;
	intervalRelationalOperatorId: number;
	intervalRelationalOperatorName: string;
	intervalSourceId: number;
	intervalSourceName: string;
	intervalNumber: number;
	goalTypeGuid?:  any;
	intervalSourceGoalTypeId: number;
	intervalSourceGoalTypeGUID?: string | null;
	goalName: string;
	intervalSourceGoalTypeName?: any;
}
