export const PROMPT_MESSAGES = {
	ConfirmSubmitTitle: 'Confirmation',
	ConfirmSubmitMessage: (title: string) => {
		return 'This action will update the ' + title + '. Please confirm';
	},
	ConfirmSubmitMessageAdd: 'This action will submit the details of the newly added record. Please confirm',
	ConfirmSubmitMessageEdit: 'This action will save the changes made. Please confirm',
	ConfirmSubmitMessageSave: (content: string) => {
		return 'This will save the ' + content + '. Please confirm';
	},
	ConfirmDeletionMessage: 'This action will delete rows on the queues list and history. Please confirm',
	ConfirmRemoveTitle: 'Confirmation',
	ConfirmRemoveMessage: (title: string) => {
		return 'This action will remove the ' + title + '. Please confirm';
	},
	ConfirmDeleteMessage: (title: string) => {
		return 'This action will delete the ' + title + '. Please confirm';
	},
	ConfirmClearTitle: 'Confirmation',
	ConfirmClearMessage: (content: string) => {
		return 'This action will clear the ' + content + '. Please confirm';
	},
	ConfirmCloseTitle: 'Confirmation',
	ConfirmCloseMessage: 'This action will discard any changes made. Please confirm',
	ConfirmDeactivateTitle: 'Deactivate',
	ConfirmActivateTitle: 'Activate',
	ConfirmDeactivateMessage: 'Area you sure you want to deactivate this record?',
	ConfirmDeactivateActivateMessage: (type: string) => {
		return 'This action will change the record status to ' + type + '. Please confirm';
	},
	ConfirmToggleRecordCallList: (title: string) => {
		return `The selected record will be ${title} to the selected Agent. Please confirm`;
	},
	ConfirmTagToMeActionMessage: 'This will tag the selected record to your name. Please confirm',
	ConfirmDiscardCallListMessage: 'This will discard the selected record from the call list. Please confirm',
	FailedValidationTitle: 'Failed',
	FailedValidationMandatoryMessage: 'Unable to proceed, kindly fill up the mandatory fields',
	FailedValidationSingleMandatoryMessage: 'Unable to proceed, kindly fill up the mandatory field',
	FailedValidationDuplicateMessage: 'Unable to record, the Record is already exist',
	FailedValidationMandatoryMessageForLogCleaner: 'Unable to proceed, End date must be 7 days before the current date',
	FailedValidationSearchDuplicateMessage: 'Value already exists, please use the search filter to find them',
	FailedValidationDuplicateMessageCustom: (type: string) => {
		return 'Unable to record, the ' + type + ' is already exist';
	},
	FailedValidationSkillDuplicate: 'Unable to proceed. Skill ID already exists on the same License ID.',
	SuccessTitle: 'Successful!',
	TestSegmentPendingTooltip:
		'The segment conditions contain Tableau field(s). Please save the segment and wait for the integration service to run before performing the test segment.',
};

export enum SegmentConditionType {
	Condition = 'CONDITION',
	Group = 'GROUP',
	Set = 'SET',
}

export enum AccordionHeaderType {
	default,
	light,
}

export enum ElementStyle {
	primary = 'primary',
	secondary = 'secondary',
	success = 'success',
	danger = 'danger',
	warning = 'warning',
	info = 'info',
	light = 'light',
	dark = 'dark',
	link = 'link',
}

export enum CampaignStatusEnum {
	Draft = 28,
	Activate = 29,
	Onhold = 30,
	Ended = 31,
	Completed = 32,
	Inactive = 33,
}

export enum EligibilityTypeEnum {
	Segmentation = 96,
	UploadPlayerList = 97,
}

export enum CampaignTypeEnum {
	WelcomeCall = 35,
	RetentionCampaign = 145,
}

export enum HttpStatusCodeEnum {
	Continue = 100,
	SwitchingProtocols = 101,
	Processing = 102,
	Ok = 200,
	Created = 201,
	Accepted = 202,
	NonAuthoritativeInformation = 203,
	NoContent = 204,
	ResetContent = 205,
	PartialContent = 206,
	MultiStatus = 207,
	AlreadyReported = 208,
	ImUsed = 226,
	MultipleChoices = 300,
	MovedPermanently = 301,
	Found = 302,
	SeeOther = 303,
	NotModified = 304,
	UseProxy = 305,
	SwitchProxy = 306,
	TemporaryRedirect = 307,
	PermanentRedirect = 308,
	BadRequest = 400,
	Unauthorized = 401,
	PaymentRequired = 402,
	Forbidden = 403,
	NotFound = 404,
	MethodNotAllowed = 405,
	NotAcceptable = 406,
	ProxyAuthenticationRequired = 407,
	RequestTimeout = 408,
	Conflict = 409,
	Gone = 410,
	LengthRequired = 411,
	PreconditionFailed = 412,
	PayloadTooLarge = 413,
	UriTooLong = 414,
	UnsupportedMediaType = 415,
	RangeNotSatisfiable = 416,
	ExpectationFailed = 417,
	IAmATeapot = 418,
	MisdirectedRequest = 421,
	UnprocessableEntity = 422,
	Locked = 423,
	FailedDependency = 424,
	UpgradeRequired = 426,
	PreconditionRequired = 428,
	TooManyRequests = 429,
	RequestHeaderFieldsTooLarge = 431,
	UnavailableForLegalReasons = 451,
	InternalServerError = 500,
	NotImplemented = 501,
	BadGateway = 502,
	ServiceUnavailable = 503,
	GatewayTimeout = 504,
	HttpVersionNotSupported = 505,
	VariantAlsoNegotiates = 506,
	InsufficientStorage = 507,
	LoopDetected = 508,
	NotExtended = 510,
	NetworkAuthenticationRequired = 511,
}

export enum AgentWorkspaceTaggingActionsEnum {
	Tag = 'tag',
	Retag = 'retag',
	TagToMe = 'tagtome',
	Dump = 'dump',
	TagSingle = 'tag-single',
	RetagSingle = 'retag-single',
	TagToMeSingle = 'tagtome-single',
	Discard = 'discard-single',
}

export enum CaseStatusEnum {
	Open = 2,
	ReOpen = 3,
	Closed = 46,
}

export enum GenericStringContantsEnum {
	EditLabel = 'Edit',
	AddLabel = 'Add',
	ViewLabel = 'View',
}

export enum pageTitle {
	DefaultTitle = 'MLAB',
	AgentWorkspace = 'Agent Workspace',
	SearchCaseAndCommunication = 'Search Case and Communication',
	
	ManageTelegramBOT = 'Manage Telegram BOT',
	SearchLeads = 'Search Leads',
	SearchBroadcast = 'Search Broadcast',
	EditTicket = 'Edit Ticket',
	ViewTicket = 'View Ticket',
	ReMDistribution = 'ReM Distribution',
	ReMProfile = 'ReM Profile',
	ReMSetting = 'ReM Setting',
	ReMAutoDistributionSetting = 'ReM Auto Distribution Setting',
	StaffPerformanceSetting = 'Staff Performance Setting',
	SearchCommunicationReviewReport = 'Search Communication Review Report',
	SearchTicket = 'Search Ticket',
	AddTicket = 'Add Ticket',

	// system modules
	OperatorList = 'Operator List',
	CreateOperator = 'Create Operator',
	EditOperator = 'Edit Operator',
	CodeList = 'Code List',
	Topic = 'Topic',
	Subtopic = 'Subtopic',
	MessageType = 'Message Type',
	MessageStatus = 'Message Status',
	MessageResponse = 'Message Response',
	FeedbackType = 'Feedback Type',
	FeedbackCategory = 'Feedback Category',

	SurveyQuestionList = 'Survey Question List',
	EditSurveyQuestion = 'Edit Survey Question',
	SurveyTemplateList = 'Survey Template List',
	EditSurveyTemplate = 'Edit Survey Template',
	PlayerConfiguration = 'Player Configuration',
	PostChatSurvey = 'Post Chat Survey Setting',
	SkillMapping = 'Skill Mapping',
	PaymentMethod = 'Payment Method',
	VipLevel = 'VIP Level',
	RiskLevel = 'Risk Level',
	PaymentGroup = 'Payment Group',
	Currency = 'Currency',
	MarketingChannel = 'Marketing Channel',
	Portal = 'Portal',
	Language = 'Language',
	PlayerStatus = 'Player Status',
	Country = 'Country',
	CommunicationReviewPeriod = 'Communication Review Period', 
	CommunicationReviewBenchmark = 'Communication Review Benchmark',
	CommunicationReviewRanking = 'Communication Review Ranking',
	CommunicationReviewCriteria = 'Communication Review Criteria',
	CommunicationReviewMeasurement = 'Communication Review Measurement',
	
	// user management modules
	UserList = 'User List',
	CreateUser = 'Create User',
	EditUser = 'Edit User',
	TeamList = 'Team List',
	CreateTeam = 'Create Team',
	EditTeam = 'Edit Team',
	RoleList= 'Role List',
	CreateRole = 'Create Role',
	EditRole = 'Edit Role',

	// Campaign Dashboard
	SurveyAndFeedback = 'Survey and Feedback',
	CampaignPerformance = 'Campaign Performance',

	//	Campaign Workspace
	PlayerProfile = 'Player Profile',
	CreateCase = 'Create Case',
	AddCommunication = 'Add Communication',
	CallListValidation = 'Call List Validation',
	AgentMonitoring = 'Agent Monitoring',
	//Player Management
	ContactLogSummary = 'Contact Log Summary',
	ViewContactDetails = 'View Contact Details',
	PlayerList = 'Player List',
	Segmentation = 'Segmentation',
	EditCase = 'Edit Case',
	ViewCase = 'View Case',
	PCS_Questionnaires = 'PCS Questionnaires',
	FlyFone= 'Fly Fone',
	EditCommunication = 'Edit Communication',
}

export enum pageMode {
	view = 'view',
	edit = 'edit',
	create = 'create',
	clone = 'clone',
}

export enum dataType {
	string = 'string',
	number = 'number',
	undefined = 'undefined',
	null = 'null',
	object = 'object',
}

export enum campaignTab {
	campaignInfoTab = '1',
	campaignConfigTab = '2',
	campaignCommunication = '3',
	campaignPlayerList = '4'
}

export enum AgentWorkspaceTaggingTitleEnum {
	Tag = 'Tag',
	ReTag = 'ReTag',
	TagToMe = 'TagToMe',
	Discard = 'Discard',
}

export enum MessageTypeEnum {
	FlyFoneCall = 1,
	WebPush = 3,
	Email = 2,
	CloudTalk = 13,
	Samespace = 30
}

export enum MessageStatusEnum {
	Contactable = 'Contactable',
	InvalidNumber = 'Invalid Number',
	Uncontactable = 'Uncontactable',
}

export enum SegmentFieldEnum {
	MlabPlayerId = 'MLab Player Id',
}

export enum SegmentConditionOperatorsEnum {
	Like = 'LIKE',
	NotLike = 'NOT LIKE',
	In = 'IN',
	NotIn = 'NOT IN',
	True = 'TRUE',
	False = 'FALSE',
	IsTagged = 'IsTaggedOnCampaignID',
	Today = 'Today',
	ThisMonth = 'This month',
	LastXDays = 'Last x days',
	NextXDays = 'Next x days',
	Before = 'Before',
	After = 'After',
	On = 'On',
	InFile = 'In (File)',
}

export enum SegmentConditionDataTypesEnum {
	varchar = 'varchar',
	datetime = 'datetime',
	bit = 'bit',
	bigint = 'bigint',
}

export enum SegmentConditionFieldValuesEnum {
	Brand = 3,
	MarketingChannel = 16,
	Country = 7,
	Currency = 4,
	PlayerStatus = 6,
	InternalAccount = 14,
	Deposited = 9,
	BonusAbuser = 13,
	VipLevel = 8,
	PaymentGroup = 12,
	IsTagged = 21,
}

export enum CampaignMessageTypeEnum {
	FlyFoneCall = 'FlyFone Call',
	WebPush = 'Web Push',
	Email = 'Email',
	CloudTalk = 'CloudTalk Call',
	Samespace = 'Samespace Call',
}

export enum SegmentConditionTypes {
	Single = 196,
	Set = 197,
}

export enum SegmentConditionValueTypes {
	text = 202,
	datepicker = 203,
	boolean = 204,
	dropdown = 205,
}

export enum SegmentLookupFieldsEnum {
	Brand = 'Brand',
	Currency = 'Currency',
	PlayerStatus = 'PlayerStatus',
	Country = 'Country',
	VipLevel = 'VipLevel',
	PaymentGroup = 'PaymentGroup',
	MarketingChannel = 'MarketingChannel',
	Segment = 'Segment',
	Variance = 'Variance',
	Campaign = 'Campaign',
	CampaignGoal = 'CampaignGoal',
	CampaignGoalReached = 'CampaignGoalReached',
	Product = 'Product',
	Lifestage = 'Lifestage',
	SignupPortal = 'SignupPortal',
	LastLoginPortal = 'LastLoginPortal',
	Margin = 'Margin',
	Vendor = 'Vendor',
	CaseType = 'CaseType',
	MessageStatus = 'MessageStatus',
	MessageResponse = 'MessageResponse',
	SegmentInputType = 'SegmentInputType',
	PaymentMethod = 'PaymentMethod',
	BonusContextStatus = 'BonusContextStatus',
	BonusContextDateMapping = 'BonusContextDateMapping',
	BonusCategory = 'BonusCategory',
	ProductType = 'ProductType',
	VipLevelChangeType = 'ChangeType',
	NewVipLevel = 'NewVipLevel',
	RemProfile = 'RemProfile',
	PreviousVipLevel = 'PreviousVipLevel',
}

export enum SegmentTypes {
	Normal = '193',
	Distribution = '194',
}

export enum CommunicationTypeEnum {
	EmailAndWebPushCommumication = 1,
}

export enum SegmentStateActionTypes {
	SegmentInitialState,
	SegmentName,
	SegmentDescription,
	SegmentStatus,
	SegmentType,
	SegmentQuery,
	SegmentConditions,
	SegmentVarianceList,
	SegmentInFilePlayers,
	ResetState,
}

export enum SegmentPageAction {
	EDIT = 'edit',
	CLONE = 'clone',
	CONVERT_TO_STATIC = 'tostatic',
	VIEW = 'view',
}

export enum SegmentSourceTypes {
	Mlab = 199,
	Tableau = 200,
}

export enum SegmentLookupDrilldownFieldsEnum {
	Segment = 25,
	Variance = 26,
	Campaign = 28,
	CampaignGoal = 29,
	CaseType = 74,
	MessageStatus = 75,
	MessageResponse = 76,
	NewVipLevel = 95,
	PreviousVipLevel = 99,
}

export enum SegmentConditionLogicSubstringEnum {
	AND = 'AND ',
	OR = 'OR ',
}

export enum ToggleTypeEnum {
	Activate = 'Activate',
	Deactivate = 'Deactivate',
}

export enum StatusTypeEnum {
	Active = 'Active',
	Inactive = 'Inactive',
}

export enum ChannelType {
	ChatIntegrationId = '261',
	ContactDetails = '191',
	Communication = '190',
}

export enum ModalName {
	Skill = 'Skill',
}

export enum AppConfigSettingDataType {
	String = 'string',
	Int = 'int',
	Bool = 'bool',
	DateTime = 'DateTime',
}

export const FILTER_DISPLAY_MESSAGES = {
	NoAddedFilter: '*No topic/subtopic filter yet.',
	WithAddedFilter: (topicCount: string, subtopicCount: string) => {
		return '*' + topicCount + ' Topic(s) and ' + subtopicCount + ' Subtopic(s) selected.';
	},
};
export enum CaseTypeEnum {
	Campaign = 2,
	CustomerService = 3
}

export enum CaseTypeName {
	Campaign = 'Campaign',
	CustomerService = 'Service',
}

export enum SegmentDependencyLookupEnum {
	MessageStatus = 'MessageStatus',
	MessageResponse = 'MessageResponse',
}

export enum FilterFieldKeyword {
	PlayerId = 'p.PlayerId',
	MlabPlayerId = 'p.MlabPLayerId',
	Items = 'items)',
}

export const SegmentThresholdLimit = {
	ThresholdCount: 100000,
	ValidationMessage: 'This condition will result to more than 100K players and might cause performance issue. You may consider adding new condition. Proceed to save?',
}

export enum RelationalOperatorIds {
	LastThreeMonths = 21,
}

export enum RestrictionFields {
	Brand = 331,
	Currency = 332,
	Country = 334,
	VipLevel = 333,
}
export enum MessageGroupEnum {
	Call = 288,
	Notification = 289,
	Chat = 290,
	SMS = 291,
	Email = 335,
}

export enum CustomEventTypeEnum {
	CreateNew = '1',
	SelectExisting = '2',
}

export enum PaginationEventsEnum {
	FirstPage,
    PrevPage,
    NextPage,
    LastPage,
    PageSize
}
export enum MainModuleEnum {
	CommunicationReview = 11
}
export enum SubModuleEnum {
	CommunicationReviewer    = 46,
	CommunicationReviewee    = 47,
	CommunicationAnnotation  = 48,
	CommunicationReviewReport = 50,
	ManagePrimaryFlag = 69
}
export enum AutoReplyTypeEnum {
	Default = 'Default',
	Custom = 'Custom'
}
export enum AutoReplyTriggerEnum{
	CommandReceived="Command Received",
}
export enum TelegramBotEnum{
	//If time allows, we'll consider moving to the DB Appsettings.
	//Maximum number of custom commands that can be added to a bot.
	CustomCommandLimitCount = 20, 
	PhotoMaxFileSize = 2 //MB
}

export enum CustomizeSection {
	SearchFilter = '397',
	SearchResult = '398'
}

export enum StatusColor {
	Online = '#06be06',
	Idle = '#FFCC00'
}

export const scrollableHeaders = [
	'/ticket-management/search-ticket',
	'/ticket-management/add-ticket',
	'/ticket-management/view-ticket',
	'/ticket-management/edit-ticket'
];

export enum SubscriberStatus {
	Active = 123,
	InActive = 124
}