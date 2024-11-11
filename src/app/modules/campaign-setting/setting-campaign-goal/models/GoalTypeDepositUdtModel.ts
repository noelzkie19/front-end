export interface GoalTypeDepositUdtModel {
	goalTypeDepositId: number;
	goalTypeName: string;
	goalTypeId: number;
	campaignSettingId: number;
	goalTypeTransactionTypeId: number;
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
	nthNumber: number;
	thresholdTypeId: number;
	intervalSourceGoalTypeId: number;
	intervalSourceGoalTypeName?: any;
	intervalSourceGoalTypeGUID?: string | null;
	goalName?: string;
	depositGuid: string;
}
