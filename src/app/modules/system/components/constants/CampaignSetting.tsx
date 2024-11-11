export const enum MasterReference {
  GoalType = 36,
  Sequence = 53,
  CommunicationDataSource = 60,
  CommunicationPeriod = 64,
  GoalTypeTransactionType = 51,
  DepositDateSourceFTD = 67,
  DepositPeriod = 69,
  DepositDateSourceInitialDeposit = 160,
  GoalParameterAmount = 47,
  GoalParameterCount = 49,
  GameActivityProductType = 238,
  GameActivityTransactionType = 232,
  ThresholdDepositTransactionType = 229,
  GameActivityDateSource = 235,
  GoalTypeCommunicationIntervalSource = 224,
  GoalTypeDepositIntervalSource = 216,
  GoalTypeIntervalRelationalOperator = 207,
  MLABService = 282,
  DatasourceMlabId = 127,
  DatasourceTableauId = 322,
  DatasourceAllId = 0,
  DatasourceDefaultSelectedId = 2,
  DatasourceDefaultSelectedTableauId = 14,
}

export const enum GoalType {
	CommunicationRecordId = 37,
	DepositId = 38,
	GameActivityId = 206,
}
export const DateSourceCommunicationRecord = [
	{value: '217', label: 'Created Date'},
	{value: '218', label: 'Start Date'},
	{value: '219', label: 'End Date'},
];
export const DateSourceGameActivity = [{value: 999, label: 'AggEndDate '}];
export const enum MasterReferenceChild {
	FirstTimeDepositAmount = 48,
	InitialDepositAmount = 157,
	NthNextDeposit = 252,
	TotalDeposit = 253,
	OnorBefore = 208,
	OnorAfter = 209,
	NthDepositDate = 220,
	InitialDepositDate = 221,
	AggEndDate = 999,
	AggEndDateGameActivity = 254,
	TransactionTypeLoss = 234,
	ThresholdTypeCount = 231,
	FirstTimeDepositDate = 258,
	UpdatedDate = 259,
}

export const enum TransactionType {
	InitialDepositId = '72',
	FirstTimeDepositId = '52',
	NthNextDepositId = '252',
	TotalDeposit = '253',
}

export const enum DateSourceSelected {
	UpdatedDateId = '153',
	FirstTimeDepositDateId = '68',
}

export const enum SwalDetails {
	ErrorIcon = 'error',
	ErrorTitle = 'Error',
	ErrorMandatoryText = 'Unable to proceed, kindly fill up all mandatory fields',
	ErrorMinMaxText = 'Unable to proceed. Values must be greater than 0. Min value must be less than max value',
	FailedTitle = 'Failed',
	DuplicateGoalType = 'Unable to proceed, goal type name already exists',
	ErrorNthNumber = 'Invalid Nth Number. Value must be greater than 0.',
}

export const enum GoalSettingCommons {
	MAX = 'Max',
	MIN = 'Min',
	ADD = 'Add',
	EDIT = 'Edit',
	VIEW = 'View',
	DEPOSIT = 'Deposit',
	SUCCESS = 'Success',
	FAILED = 'Failed',
	ACTIVE = 'Active',
	INACTIVE = 'Inactive',
	ASC = 'asc',
	FIRST_TIME_DEPOSIT_DATE = 'First Time Deposit Date',
	UPDATED_DATE = 'Updated Date',
	COMMUNICATION_RECORD = 'Communication Record',
	GAME_ACTIVITY = 'Game Activity',
	ENDED = 'Ended',
}

export const enum CampaignSettingStatus {
	Active = '1',
	Inactive = '0',
}

export const enum CampaignSettingStatusId {
	Active = 1,
	Inactive = 0,
	Active_Inactive = 2,
}

export const enum GoalSettingHeaders {
	HEADER_NO = 'No',
	HEADER_CAMPAIGN_NAME = 'Campaign Name',
	HEADER_CAMPAIGN_STATUS = 'Campaign Status',
	HEADER_CAMPAIGN_REPORT_PERIOD = 'Campaign Report Period',
	HEADER_CAMPAIGN_SETTING_ID = 'Campaign Setting Id',
	HEADER_SEQUENCE = 'Sequence',
	HEADER_GOAL_TYPE = 'Goal Type',
	HEADER_DATA_SOURCE = 'Data Source',
	HEADER_PERIOD = 'Period',
	HEADER_ACTION = 'Action',
}

export const enum GoalSettingFields {
	FIELD_NO = 'no',
	FIELD_CAMPAIGN_NAME = 'campaignName',
	FIELD_CAMPAIGN_STATUS = 'campaignStatus',
	FIELD_CAMPAIGN_REPORT_PERIOD = 'campaignReportPeriod',
	FIELD_CAMPAIGN_SETTING_ID = 'campaignSettingId',
	FIELD_SEQUENCE = 'sequenceName',
	FIELD_GOAL_TYPE = 'goalTypeName',
	FIELD_DATA_SOURCE = 'goalTypeDataSourceName',
	FIELD_PERIOD = 'goalTypePeriodName',
	FIELD_POSITION = 'position',
}

export const enum PointIncentiveSettingHeaders {
	HEADER_NO = 'No',
	HEADER_SETTING_NAME = 'Setting Name',
	HEADER_SETTING_STATUS = 'Setting Status',
	HEADER_SETTING_TYPE = 'Setting Type',
	HEADER_CREATED_DATE = 'Created Date',
	HEADER_CREATED_BY = 'Created By',
	HEADER_LAST_MODIFIED_DATE = 'Last Modified Date',
	HEADER_LAST_MODIFIED_BY = 'Last Modified By',
	HEADER_ACTION = 'Action',
}

export const enum PointIncentiveSettingFields {
	FIELD_NO = 'no',
	FIELD_SETTING_NAME = 'campaignSettingName',
	FIELD_SETTING_STATUS = 'settingStatusName',
	FIELD_SETTING_TYPE = 'settingTypeName',
	FIELD_CREATED_DATE = 'createdDate',
	FIELD_CREATED_BY = 'createdBy',
	FIELD_UPDATED_DATE = 'updatedDate',
	FIELD_UPDATED_BY = 'updatedBy',
	FIELD_POSITION = 'position',
}

export const enum ThresholdDeposit {
	Amount = 230,
	Count = 231,
}
