import {LookupModel} from '../../../common/model';

export interface CustomerCaseModel {
	caseInformationId: number;
	brand: string;
	caseType: number;
	caseStatus: string;
	communicationOwner: string;
	username: string;
	mlabPlayerId: number;
	currency: string;
	vipLevel: string;
	paymentGroup: string;
	playerId: string;
	caseOrigin: number;
	caseCreatedBy: string;
	caseCreatedDate: string;
	updatedBy: string;
	updatdeDate: number;
	subject: string;
	languageCode: string;
	topic: string;
	subtopic: number;
	campaignList: Array<LookupModel>;
}
