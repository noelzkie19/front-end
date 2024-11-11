import { LookupModel } from "../../../common/model";
import { UserOptionModel } from "../../user-management/models";
import { CustomerPlayerUsernameResponseModel } from "./response/CustomerPlayerUsernameResponseModel";

export interface CustomerCaseGenInfoPropsModel {
	pageAction: string;
	caseId?: number;
	brand: any;
	setBrand: (e: any) => void;
	brandOptions: Array<any>;
	currency: string;
	caseTexStatus: string;
	caseType: any;
	setCaseType: (e: any) => void;
	caseOwner: any;
	setCaseOwner: (e: any) => void;
	vipLevel: string;
	username: any;
	setUsername: (e: any) => void;
	playerId: any;
	setPlayerId: (e: any) => void;
	userList: Array<UserOptionModel>;
	onChangeUsername: (e: any) => void;
	searchUserName: (e: string) => void;
	onChangePlayerId: (e: any) => void;
	searchPlayerId: (e: string) => void;
	paymentGroup: string;
	usernameOptions: Array<CustomerPlayerUsernameResponseModel>;
	playerIdOptions: Array<CustomerPlayerUsernameResponseModel>;
	setUsernameOptions: (e: Array<CustomerPlayerUsernameResponseModel>) => void;
	setPlayerIdOptions: (e: Array<CustomerPlayerUsernameResponseModel>) => void;
	campaignNames: Array<LookupModel>;
	setCampaignNames: (e: any) => void;
}