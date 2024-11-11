import {RequestModel} from '../../../system/models';

export interface CampaignPlayerFilterRequestModel extends RequestModel {
	campaignId: number;
	campaignTypeId: number;
	campaignStatus: number;
	agentId: string; // CSV
	playerId: string; //CSV
	playerStatus: number;
	username: string; //CSV
	marketingSource: string; //CSV
	currency: string; //CSV, currencyId
	registeredDateStart: string;
	registeredDateEnd: string;
	deposited: string; //CSV, YES/NO
	ftdAmountFrom?: number;
	ftdAmountTo?: number;
	ftdDateStart: string;
	ftdDateEnd: string;
	taggedDateStart: string;
	taggedDateEnd: string;
	primaryGoalReached: string; //CSV, YES,NO
	primaryGoalCountFrom?: number;
	primaryGoalCountTo?: number;
	primaryGoalAmountFrom?: number;
	primaryGoalAmountTo?: number;
	callListNotes: string; // with * wildcard search
	mobileNumber: string; // with * wildcard search
	messageResponseAndStatus: string; // CSV
	mobileVerificationStatusId: number;
	callCaseCreatedDateStart: string;
	callCaseCreatedDateEnd: string;
	pageSize?: number;
	offsetValue?: number;
	sortColumn?: string;
	sortOrder?: string;
	lastLoginDateStart: string;
	lastLoginDateEnd: string;
	initialDepositAmount?: number;
	initialDepositDateStart: string;
	initialDepositDateEnd: string
	intialDepositMethod: string;
	initialDeposited: string;
}

export function AgentWorkspaceFilterRequestModelFactory() {
	const newItem: CampaignPlayerFilterRequestModel = {
		campaignId: 0,
		campaignTypeId: 0,
		campaignStatus: 0,
		agentId: '', //CSV, agentId
		playerId: '', //CSV
		playerStatus: 0,
		username: '', //CSV
		marketingSource: '', //CSV
		currency: '', //CSV, currencyId
		registeredDateStart: '',
		registeredDateEnd: '',
		deposited: '', //CSV, YES/NO
		ftdAmountFrom: 0,
		ftdAmountTo: 0,
		ftdDateStart: '',
		ftdDateEnd: '',
		taggedDateStart: '',
		taggedDateEnd: '',
		primaryGoalReached: '', //CSV, YES,NO
		primaryGoalCountFrom: 0,
		primaryGoalCountTo: 0,
		primaryGoalAmountFrom: 0,
		primaryGoalAmountTo: 0,
		callListNotes: '', // with * wildcard search
		mobileNumber: '', // with * wildcard search
		messageResponseAndStatus: '', // CSV
		mobileVerificationStatusId: 0,
		callCaseCreatedDateStart: '',
		callCaseCreatedDateEnd: '',
		queueId: '',
		userId: '',
		lastLoginDateStart: '',
		lastLoginDateEnd: '',
		initialDepositAmount: 0,
		initialDepositDateStart: '',
		initialDepositDateEnd: '',
		intialDepositMethod: '',
		initialDeposited: '',
	};
	return newItem;
}
