export interface GoalTypeListConfigurationModel {
	goalTypeCommunicationRecordDepositId: number;
	goalTypeId: number;
	goalTypeName: string;
	goalName?: string;
	campaignSettingId: number;
	goalTypeDataSourceName: string;
	goalTypePeriodName: string;
	createdBy: string;
	createdDate?:  any;
	updatedBy: string;
	updatedDate?:  any;
	goalTypeGuid?: string | null;
	intervalRelationalOperatorId: number;
	intervalRelationalOperatorName: string | null;
	intervalSourceId: number;
	intervalSourceName: string | null;
	intervalNumber: number;
	intervalSourceGoalTypeId: number;
	intervalSourceGoalTypeName: string | null;
	goalTypeDataSourceId: number;
	goalTypeTransactionTypeId: number | null;
	thresholdTypeId: number | null;
}
