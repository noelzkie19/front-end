const useConstant = () => {
	let HubConnected = 'Connected';
	let successResponse: number = 200;
	let noContentResponse: number = 204;
	let notFoundResponse: number = 404;
	let properFormatDate = 'dd-MM-yyyy';
	let properFormatDateHourMin = 'dd-MM-yyyy HH:mm';
	let properFormatDateHourMinSec = 'dd/MM/yyyy HH:mm:ss';
	let properFormatDateHourMinSecDashed = 'dd-MM-yyyy HH:mm:ss';
	let tinyMCEKey = 'h7lkyiq4ra82i892c956eh95ga20a9ing8yy5fbew0ppie3j';
	let defaultFormatDateHourMinSec = 'dd/mm/yyyy hh:mm:ss';
	let InvalidNumberLowerCase = 'invalid number';
	let ContactableLowerCase = 'contactable';
	let UncontactableLowerCase = 'uncontactable';
	let MinuteLowerCase = 'minute';
	let sensitiveDefaultValue: string = '***************';

	const SkillMappingMessageType = {
		LIVE_PERSON : '12',
	};

	const MLAB_FORMATS = {
		dateTimePlaceholder: 'DD/MM/YYYY HH:mm:ss',
	};

	const MCORE_PORTALS = {
		LocalPortal: ['localhost', 'https://icman00bo.comtradegaming.com/BOPortal/'],
		DevPortal: ['mlabuno', 'https://icman00bo.comtradegaming.com/BOPortal/'],
		TestPortal: ['mlabura', 'https://icmanrcbo.comtradegaming.com/BOPortal/'],
		StagePortal: ['mlabstg', 'https://mcorebostg.com/BOPortal/'],
		ProdPortal: ['mlabbo', 'https://mcorebo.com/BOPortal/'],
	};

	const caseStatus = {
		Open: 2,
		ReOpen: 3,
		Closed: 46,
	};

	const messageTypes = {
		Call: 1,
	};

	const masterReferenceIds = {
		parentId: {
			Purpose: 4,
			CaseStatus: 1,
			ContactType: 7,
			CampaignStatus: 27,
			CampaignType: 34,
			GoalType: 36,
			SettingType: 39,
			MessageGroup: 287,
			VIPGroup: 356,
			Subscription: 406,
		},
		childId: {
			AddCommunication: 5,
			VIP: 357,
			NonVip: 358,
			SameSpaceIntegration: 355,
		},
	};

	const message = {
		requiredAllFields: 'Unable to proceed, kindly fill up all mandatory fields',
		requiredFields: 'Unable to proceed, kindly fill up the mandatory fields',
		alreadyExist: 'Value already exists, please use the search filter to find them',
		genericSaveConfirmation: 'This action will save the changes made. Please confirm',
		caseSaveAndClose: 'This action will save the case in closed status. Please confirm.',
		caseSaveAndOpen: 'This action will save the case in open status. Please confirm.',
		caseCloseOnly: 'This action will change the case status to Closed. Please confirm.',
		caseCommNoCommProviderOnUser: 'There is no Communication Provider Account added to your account, you will not be able to create the case.',
		gridMessage: {
			gridNoRowsToShow: 'No Rows To Show',
			gridLoading: 'Please wait while your items are loading',
		},
		customerCase: {
			communicationSurveyError: 'Problem in getting customer case communication survey',
			caseCommunicationsError: 'Problem in getting customer case communication information',
			caseInformationError: 'Problem in getting customer case informations',
			communicationFeedbackError: 'Problem in getting customer case communication feedback',
			flyfoneConnectionError: 'Problem connecting to Flyfone',
			caseCommCloudTalkError: 'Problem Connecting to Cloudtalk',
			samespaceConnectionError: 'Problem connecting to Samespace',
			cloudtalkHasNoRecordingLinkError:
				'Recording link is not available at this moment and will be retrieved by the service, once available it will be added on this communication content',
			samespaceHasNoRecordingLinkError:
				'Recording link is not available at this moment and will be retrieved by the service, once available it will be added on this communication content',
		},
		codeList: {
			messageTypeOptionListError: 'Problem getting message type list',
		},
		communicationReview: {
			communicationReviewLookupsError: 'Problem in getting communication review lookups.',
			communicationReviewCriteriaListError: 'Problem in getting communication review criteria list.',
		},
		communicationContentEditWarning:
			'Communication Content has existing annotation/line comment. This action might impact the existing annotation. Do you want to proceed?',
		
	};

	const SwalConfirmMessage = {
		title: 'Confirmation',
		textDiscard: 'This action will discard any changes made. Please confirm',
		textSaveChannel: 'This action will save the new channel request. Please confirm',
		textSaveSubtopic: 'This action will submit the details of the newly added record. Please confirm',
		textSaveConfirm: 'This action will submit the details of the newly added record. Please confirm',
		textConfirmRemove: 'This action will remove the record. Please confirm',
		textConfirmationAgentValidationUpdate: 'This action will update the Agent Validation, please confirm',
		textRecordValidated: 'Record has been validated. Please confirm if you want to proceed',
		icon: 'warning',
		btnYes: 'Yes',
		btnNo: 'No',
		btnCancel: 'Cancel',
		btnConfirm: 'Confirm',
	};

	const SwalFailedMessage = {
		title: 'Failed',
		textMandatory: 'Unable to proceed, kindly fill up the mandatory fields',
		textSubtopicExists: 'Unable to proceed, Subtopic Name already exists.',
		textAccountIdExists: 'Unable to proceed, Account Id already exists.',
		textPaymentMethodNameIcoreIdExists: 'Unable to proceed, Icore ID/Payment Method Name already exists.',
		textReviewPeriodNameExists: 'Unable to proceed, Review Period Name already exists.',
		textEmailAddressWrongFormat: 'Email address is in wrong format',
		textCommunicationDateValidation: 'Unable to proceed, Communication end date and time must be higher than Communication Start date',
		textSurveyTemplateMandatory: 'Unable to proceed, Kindly fill up the Survey Template mandatory fields',
		textCampaignNameCountExceeded: 'Maximum number of Campaign Name reached',
		textNoDataFound: 'No Data found, unable to export',
		textUpsertTransactionDataFailed: 'Unable to save transaction data',
		textCampaignPerformanceDataError: 'Problem in getting campaign performance data',
		textNoTicketStatusMappingFound: 'No Ticket Status mapping found',
		textNoTicketTresholdFound: 'No Ticket Threshold found',
		textNoTransactionFieldMappingFound: 'No Transaction Field mapping found',
		textICorePendingFMBORejectStatus: 'Unable to send to next status, please verify transaction status',
		textUpsertPopUpFailed: 'Unable to save ticket details',
		textStaffPerformanceReviewPeriodPopUpFailed: 'Unable to save review period',
		textMaxCharactersError: 'Unable to proceed. More than 4000 characters',
		textAgentValidationProblem: 'Problem creating the agent validation',
		textSurveyTemplateProblem: 'Problem in getting survey template list',
		icon: 'error',
	};

	const SwalSuccessMessage = {
		title: 'Success',
		textSuccess: 'Record successfully submitted',
		icon: 'success',
	};

	const SwalSuccessRecordMessage = {
		title: 'Successful!',
		textSuccess: 'Record successfully submitted',
		icon: 'success',
	};

	const SwalSuccessDeleteRecordMessage = {
		title: 'Successful!',
		textSuccess: 'Record successfully deleted',
		icon: 'success',
	};

	const SwalServerErrorMessage = {
		title: 'Failed',
		textError: 'Problem connecting to the server, Please refresh',
		icon: 'error',
		textErrorStartingConnection: 'Error while starting connection',
	};

	const SwalUserConfirmMessage = {
		title: 'Confirmation',
		textDiscard: 'This action will discard any changes made and return to User Search page, please confirm',
		icon: 'warning',
		btnYes: 'Yes',
		btnNo: 'No',
	};

	const SwalSegmentMessage = {
		titleConvertStatic: 'Convert To Static',
		textNoRecord: 'No Record Found',
		iconInfo: 'info',
		titleFailed: 'Failed',
		textProblemConvert: 'Problem in Convert Segment to Static',
		textPlayerUnavailable: 'Unable to proceed, segment has no player. You will be redirected to Manage Segment',
		textActionUnavailable: 'Segment has Tableau condition(s). Convert to Static is not applicable. Page will now redirect to Manage Segments',
		textTestSegment: 'Test Segment',
		textProblemInMessageType: 'Problem in getting message type list',
		textSegmentExists: 'Unable to proceed, Segment Name already exists',
		textSegmentMandatory: 'Unable to proceed, kindly fill up the mandatory fields',

		iconError: 'error',
		btnYes: 'Yes',
		btnNo: 'No',
	};

	const SwalCampaignMessage = {
		titleConfirmation: 'Confirmation',
		textConfirmCampaign: 'This action will update the setting data and configuration, please confirm',
		iconWarning: 'warning',
		titleError: 'Error',
		textDuplicateSettingName: 'Unable to record, the Setting Name is already exist',
		textDuplicateCustomEvent: 'Unable to proceed, message that covers the selected Currency and Country already exists',
		textCustomEventAreadyExist: 'Unable to proceed, Custom Event Already exist',
		textErrorSavingPlayer: 'Error Saving Player Status Details',
		textMaxCustomEventLimitReached: 'Unable to proceed, max limit of 30 custom event is reached',
		textConfirmSaveCampaignCustomEvent: 'This action will save the changes made. Please confirm',
		textConfirmDiscardCampaignCustomEvent: 'This action will discard any changes made, please confirm',
		iconError: 'error',
		titleFailed: 'Failed',
	};

	const SwalCodelistMessage = {
		textCodelistSubmit: 'This action will update the Code List, please confirm',
	};

	const SwalOperatorMessage = {
		textErrorCreateOperator: 'Unable to proceed, please make sure Operator, Brand and Currency is configured',
		textErrorBrandValidation: 'You did not fill up brand id or brand name',
		textErrorBrandDuplicate:
			'Unable to proceed, Brand ID or Brand Name already exist. If you want to edit an existing brand please find them from search page',
		textErrorBrandMissing: 'You did not add any brand',
		textErrorOperatorFilterType: 'Operator Id should be a number',
		textErrorBrandFilterType: 'Brand Id should be a number',
	};

	const SwalMessageTypeMessage = {
		textErrorMessageTypeList: 'Problem in getting message type list',
		textErrorMessageTypeNotFound: 'Message Type Record not found',
	};

	const SwalMessageResponseMessage = {
		textErrorMessageResponseList: 'Problem in getting message response list',
	};

	const SwalMessageStatusMessage = {
		textErrorMessageStatusList: 'Problem in getting message status list',
	};

	const SwalFeedbackMessage = {
		textErrorFeedbackList: (title: string) => {
			return 'Problem in getting ' + title + ' list.';
		},
		textErrorSavingPlayerConfig: (title: string) => {
			return 'Error Saving ' + title + ' Details.';
		},
		textErrorNotFound: (title: string) => {
			return title + 'record not found.';
		},
		textErrorAlreadyExists: 'Value already exists, please use the search filter to find them',
	};

	const SegmentGridColumns = {
		headerNumber: 'No',
		headerPlayerId: 'Player Id',
		headerUsername: 'Username',
		headerBrand: 'Brand',
		headerCurrency: 'Currency',
		headerVIPLevel: 'VIP Level',
		headerAccountStatus: 'Account Status',
	};

	const FnsDateFormatPatterns = {
		mlabDateFormat: 'dd/MM/yyyy HH:mm:ss',
		MMddyyy: 'MM/dd/yyyy',
	};

	const CSVConvertorHeaders = {
		CampaignGoalPerformance: 'Campaign Goal Performance',
		FTDPercentage: 'FTD Percentage',
		DistributionMessageStatusByCurrency: 'Distribution of Message Status By Currency',
		ContactableRate: 'Contactable Rate',
	};

	const SwalTransactionSuccessMessage = {
		title: 'Success',
		textSuccess: 'Transaction successfully submitted',
		icon: 'success',
	};

	const SwalTransactionErrorMessage = {
		title: 'Failed',
		textError: 'Problem connecting to the server, Please refresh',
		icon: 'error',
	};

	const SwalGatewayErrorMessage = {
		title: 'Failed',
		textError: 'Problem in Connection on Gateway',
		icon: 'error',
	};

	//#region Communication Review
	const SwalCommunicationReviewConfirmMessage = {
		title: 'Confirmation',
		textSaveConfirm: 'This action will record the communication review with the corresponding Review Score. Please confirm.',
		textMarkAsReadConfirm: 'This action confirms that you have read the selected communication record. Do you want to proceed?',
		textReviewStartConfirm: 'You are about to start the review for this communication:',
		textReviewStartFromViewConfirm: 'This action will close View mode and start a new review record for this communication:',
		textCancelConfirm: 'This action will cancel the communication review and revert back the previous values of the fields. Please confirm.',
		textSetPrimaryConfirm: 'This will set the selected communication review as Primary. Please confirm.',
		textAutoFailConfirm: 'This Criteria will auto-fail the review.',
		textRemovePrimaryConfirm: 'This action will remove the primary flag of the selected record. Please confirm.',
		icon: 'warning',
		btnYes: 'Yes',
		btnNo: 'No',
	};

	const SwalCommunicationReviewFailedMessage = {
		title: 'Failed',
		textReviewLimitError: 'Review limit has been reached.',
		icon: 'error',
		btnYes: 'Yes',
		btnNo: 'No',
	};

	const SwalCommentSuccessRecordMessage = {
		title: 'Successful!',
		textAdded: 'Record added',
		textUpdated: 'Record updated',
		icon: 'success',
	};

	const SwalCommentCancelMessage = {
		title: 'Cancelled',
		textCancel: 'Action cancelled',
		icon: 'error',
	};

	const SwalAnnotationSuccessMessage = {
		title: 'Successful!',
		textAddSuccess: 'Annotation successfully saved.',
		textUpdateConfirm: 'This action will edit the existing annotation. Please confirm.',
		textAddConfirm: 'This action will save the annotation. Please confirm.',
		icon: 'success',
	};

	const SwalAnnotationCancelMessage = {
		title: 'Cancelled',
		text: 'Action cancelled',
		icon: 'error',
	};

	const SwalAnnotationRemoveMessage = {
		title: 'Remove',
		textRemoveConfirm: 'This action will remove the annotation. Please confirm.',
		icon: 'success',
	};

	const SwalUserListMessage = {
		titleFailed: 'Failed',
		titleSuccessful: 'Successful!',
		titleConfirmation: 'Confirmation',
		textErrorRoleId: 'Role Id should be a number',
		textErrorGetTeamList: 'Problem in getting team list',
		textErrorGetUserList: 'Problem in getting user list',
		textErrorUserLock: 'Problem locking the user',
		textConfirmChangeUserStatus: 'Are you sure you want to change status of the user?',
		textChangesApplied: 'Changes has been applied',
		iconError: 'error',
		iconWarning: 'warning',
		iconSuccess: 'success',
		btnNo: 'No',
		btnYes: 'Yes',
	};

	const BotDetailConstants = {
		ADD: 'ADD',
		EDIT: 'EDIT',
		BotStatusDefault: {value: '363', label: 'Active'},
		SwalBotDetailMessage: {
			requiredAllFields: 'Unable to proceed, kindly fill up all mandatory fields',
			textErrorDuplicate: 'Unable to record, the Bot Id already exists',
			textSuccess: 'Record successfully submitted',
			textFailed: 'Problem saving bot details',
			textDiscarded: 'This action will discard any changes made, please confirm',
			textMaxActiveBotError: 'Unable to proceed, a maximum of 10 bots can be active simultaneously.',
			textMaxEditActiveBotError: 'Unable to update the BOT, only 10 Active BOT can exist at the same time.',
			textSubmitConfirmation: 'This action will submit the details of the newly added record. Please confirm',
			titleFailed: 'Failed',
			titleError: 'Error',
			titleSuccessful: 'Successful!',
			titleConfirmation: 'Confirmation',
			iconError: 'error',
			iconWarning: 'warning',
			iconSuccess: 'success',
			btnNo: 'No',
			btnYes: 'Yes',
			textFailedBotNotExist: 'Unable to record, the Bot Configuration does not exist in Telegram',
		},
		BotStatusMasterReferenceParentId: '362',
	};

	const AgentValidationsMessage = {
		textOverWriteExistingValuesOneReviewed: 'The selected records have different values. This action will overwrite the existing values and one of the records has been reviewed.',
		textOverwriteExistingOnly: 'The selected records have different values. This action will overwrite the existing values.',
		textOneofRecordReviewd: 'One of the records has been reviewed.',
		textProblemCreatingLeaderValidation: 'Problem creating the leader validation',
		textProblemSavingLeaderValidations: 'Problem in saving leader validations: '
	}

	//#endregion

	// ticket management
	const SwalTicketManagementConfirmMessage = {
		title: 'Confirmation',
		icon: 'warning',
		btnYes: 'Yes',
		btnNo: 'No',
		textDiscarded: 'This action will discard any changes made, please confirm',
	};

	const SwalTicketManagementFailedMessage = {
		playerUnverified: 'Unable to Proceed, Player ID / Username must be validated',
	};

	const SwalSaveTicketSearchFilterConfirmMessage = {
		text: 'Search Filter is Saved and Recorded.',
	};

	const SwalTicketSuccessRecordMessage = {
		title: 'Successful!',
		textSuccess: 'Record successfully submitted',
		icon: 'success',
		button: false,
	};

	// ReM Setting Auto Distribution
	const ReMAutoDistributionConstants = {
		maxConfigPerUserId: 100,
		SwalReMAutoDistributionMessage: {
			textConfigurationNameExists: 'Unable to record, Auto Distribution Configuration Name already exists.',
			textSubmitConfirmation: 'This action will submit the details of the newly added record. Please confirm',
			textUpdateConfirmation: 'This action will update the configuration details. Please confirm',
			textDeleteConfirmation: 'Auto Distribution Configuration will be removed, please confirm',
			textCloseConfirmation: 'Any changes will be discarded, please confirm',
			textUpdateAssignment: 'This action will update the current assignment record, please confirm',
			textRemoveAssignment: 'This action will remove the current Agent record, please confirm'			
		},
		remAgentsByUserAccessError: 'Problem in getting ReM Agents list by user access',
	};

	//Search Leads
	const SearchLeadsConstants = {
		ADD: 'ADD',
		EDIT: 'EDIT',
		BotStatusDefault: {value: '363', label: 'Active'},
		ChartPortalStatusMasterRefId: '378',
		SwalSearchLeadsMessage: {
			requiredAllFields: 'Unable to proceed, kindly fill up all mandatory fields',

			textSuccess: 'Record successfully submitted',
			textFailed: 'Problem saving leads linking details',
			textDiscarded: 'This action will discard any changes made, please confirm',
			textConfirmRemove: 'This action will remove the record. Please confirm',
			textConfirmUnlink: 'Leads will be unlinked from the Player. Please confirm.',
			textConfirmSelectAll: 'You are about to send Broadcast to all Leads. Please confirm.',
			textErrorLink: 'Problem encountered while linking player.',
			titleFailed: 'Failed',
			titleError: 'Error',
			titleSuccessful: 'Successful!',
			titleConfirmation: 'Confirmation',
			iconError: 'error',
			iconWarning: 'warning',
			iconSuccess: 'success',
			btnNo: 'No',
			btnYes: 'Yes',
		},
		BotStatusMasterReferenceParentId: '362',
	};

	// Search Broadcast
	const SearchBroadcastConstants = {
		ADD: 'ADD',
		EDIT: 'EDIT',
		BotStatusDefault: {value: '363', label: 'Active'},
		ChartPortalStatusMasterRefId: '378',
		SwalSearchBroadcastMessage: {
			requiredFields: 'Unable to proceed, kindly fill up all mandatory fields',
			requiredOneField: 'Please populate at least one Search filter',
			textSuccess: 'Record successfully submitted',
			textFailed: 'Problem saving leads linking details',
			textDiscarded: 'Any changes will be discarded, please confirm',
			textConfirmRemove: 'This action will remove the record. Please confirm',
			textConfirmUnlink: 'Leads will be unlinked from the Player. Please confirm.',
			textErrorLink: 'Problem encountered while linking player.',
			titleFailed: 'Failed',
			titleError: 'Error',
			titleSuccessful: 'Successful!',
			titleConfirmation: 'Confirmation',
			iconError: 'error',
			iconWarning: 'warning',
			iconSuccess: 'success',
			btnNo: 'No',
			btnYes: 'Yes',
		},
		BroadcastStatusParentId: '384',
	};

	const UpsertBroadcastConstants = {
		ADD: 'ADD',
		EDIT: 'EDIT',
		HeaderEdit: 'Edit Broadcast',
		HeaderView: 'View Broadcast',
		MessageTypeOptionDefault: {label: 'Telegram', value: '7'},
		BroadcastStatusId: 388, //active
		BroadcastStatus: 'Active',
		BroadcastResultId: 392, //pending
		BroadcastResult: 'Pending',
		BroadcastStatusInProgressId: 385,
		BroadcastStatusInCanceledId: 387,
		Leads: 'Leads',
		Customer: 'Customer',
		SwalUpsertBroadcastMessage: {
			requiredAllFields: 'Unable to proceed, kindly fill up all mandatory fields',
			textSuccess: 'Record successfully submitted',
			textFailed: 'Problem saving broadcast configuration',
			getBroadcastError: 'Problem getting broadcast configuration',
			getBroadcastProgressError: 'Problem getting broadcast configuration progress',
			cancelBroadcastError: 'Failed to cancel broadcast',
			textDiscarded: 'Any changes will be discarded, please confirm',
			broadcastDateValidation: 'Unable to proceed, Broadcast date and time must be higher than current date and time',
			attachmentValidation: 'Invalid  File Attachment.',
			htmlTagsValidation: 'There are invalid tags in the message editor, please review changes\n',
			saveConfirmation: 'This action will update the broadcast configuration, please confirm',
			cancelConfirmation: 'This action will discard any changes made. Please confirm',
			cancelBroadcast:
				"This action will Cance the Broadcast, all services will be stopped and will affect Broadcast's progress. Please confirm to Cancel Broadcast.",
			titleFailed: 'Failed',
			titleError: 'Error',
			titleSuccessful: 'Successful!',
			titleConfirmation: 'Confirmation',
			iconError: 'error',
			iconWarning: 'warning',
			iconSuccess: 'success',
			btnNo: 'No',
			btnYes: 'Yes',
		},
		BotStatusMasterReferenceParentId: '362',
		AllowedHtmlTags: [
			'B',
			'STRONG',
			'I',
			'EM',
			'U',
			'INS',
			'S',
			'STRIKE',
			'DEL',
			'SPAN',
			'A',
			'TG-EMOJI',
			'CODE',
			'PRE',
			'BLOCKQUOTE',
			'BR',
			'P',
			'HREF',
		],
		AllowedAttachment: /\.(png|jpg|svg|gif)$/i,
	};
	const TicketManagementConstants = {
		Error: 'Error on fetching data ',
		NoAssigneeList: 'No assignee list found',
		NoOnlineAssignee:
			'Unable to auto assign to user, no online users available at the moment, Please select assignee manually from the assignee dropdown field',
		NoConfiguredUser:
			'Unable to assign to user, no users available at the moment, Please request to configure user for this ticket in User Management',
		NoHierarchy: 'No Hierarchy Found',
		NoTicket: 'Unable to find the ticket',
		NoPlayer: 'Unable to proceed, Player does not exist',
		NoTxnId: 'Unable to find the record, transactions id/provider transaction id does not exist',
		NoTicketTypes: 'No Ticket types found',
		NoFieldMapping: 'No Field Mapping found',
		FmboTransactionNotMatch: 'Unable to find the record, Fmbo Platform transaction id not match :',
		IcoreTransactionNotMatch: 'Unable to find the record, Icore Payment system transaction id not match :',
		UnableToUpdatePlatformStatus: 'Error on API. Unable to update Platform Transaction Status',
        UnableToUpdatePaymentSystemStatus: 'Error on API. Unable to update Payment System Transaction Status',
		ErrorProcessor: 'Unable to find payment processor.',
		NoProcessor: 'Payment Processor is not yet existing in MLAB, please request to add {0} in MLAB Database to consider the verifier for the ticket',
		ADD: 'ADD',
		EDIT: 'EDIT',
		VIEW: 'VIEW',
		PageModeAdd: 'add',
		PageModeEdit: 'edit',
		PageModeView: 'view',
	};
	const AttachmentConstants = {
		ImageSizeExceedMessage: 'Please select only image files and ensure each file size does not exceed ',
		title: 'Attachment',
		iconError: 'error',
		iconWarning: 'warning',
		iconSuccess: 'success',
		btnOk: 'Ok',
	};

	const SwalAPIIntegrationMessage = {
		textErrorMBC: (message: string) => {
			return message + '. Please add Manual Balance Correction manually.';
		},
		textErrorHoldWithdrawal: (message: string) => {
			return message + '. Please update Hold Withdrawal manually.';
		},
		textSuccessHoldWithdrawal: 'Hold Withdrawal for Player is successful.',
		textSuccessMBC: (currency: any, amount: any, mcoreUsername: any, mcoreUserId: any, businessReason: any) => {
			return `Adjustment is successful </br>
			Adjusted Amount: ${currency} ${amount} </br>
			Adjustment Business Type: ${businessReason} </br>
			Processed by: ${mcoreUsername} - ${mcoreUserId}`;
		},
	};

	const SearchCaseAndCommunication = {
		LivePersonField: 'Live Person',
		LivePersonFieldId: "2",
		DateByField: 'Date By',
		LivePersonMessageTypeId: '12'


	}

	return {
		MLAB_FORMATS,
		MCORE_PORTALS,
		HubConnected,
		successResponse,
		properFormatDate,
		properFormatDateHourMin,
		properFormatDateHourMinSec,
		tinyMCEKey,
		message,
		caseStatus,
		messageTypes,
		defaultFormatDateHourMinSec,
		SwalConfirmMessage,
		SwalFailedMessage,
		SwalSuccessMessage,
		SwalServerErrorMessage,
		SwalSuccessRecordMessage,
		masterReferenceIds,
		SwalUserConfirmMessage,
		InvalidNumberLowerCase,
		ContactableLowerCase,
		UncontactableLowerCase,
		MinuteLowerCase,
		SwalSegmentMessage,
		SwalCampaignMessage,
		SwalOperatorMessage,
		SwalMessageTypeMessage,
		SwalMessageResponseMessage,
		SwalCodelistMessage,
		SwalMessageStatusMessage,
		SwalFeedbackMessage,
		SegmentGridColumns,
		sensitiveDefaultValue,
		FnsDateFormatPatterns,
		noContentResponse,
		notFoundResponse,
		CSVConvertorHeaders,
		SwalTransactionSuccessMessage,
		SwalTransactionErrorMessage,
		SwalGatewayErrorMessage,
		SwalCommunicationReviewConfirmMessage,
		SwalCommunicationReviewFailedMessage,
		SwalCommentSuccessRecordMessage,
		SwalCommentCancelMessage,
		SwalAnnotationSuccessMessage,
		SwalAnnotationCancelMessage,
		SwalAnnotationRemoveMessage,
		SwalUserListMessage,
		properFormatDateHourMinSecDashed,
		BotDetailConstants,
		SwalTicketManagementConfirmMessage,
		SwalSaveTicketSearchFilterConfirmMessage,
		SwalTicketManagementFailedMessage,
		SearchLeadsConstants,
		SwalSuccessDeleteRecordMessage,
		SearchBroadcastConstants,
		TicketManagementConstants,
		UpsertBroadcastConstants,
		AttachmentConstants,
		SwalAPIIntegrationMessage,
		ReMAutoDistributionConstants,
		SwalTicketSuccessRecordMessage,
		AgentValidationsMessage,
		SearchCaseAndCommunication,
		SkillMappingMessageType,
	};
};

export default useConstant;
