import {MainModuleModel} from '../../../../models/MainModuleModel';
import {SECURABLE_NAMES} from '../../../constants/SecurableNames';
import $ from 'jquery';
import {MainModuleEnum} from '../../../../../../constants/Constants';
import {homeSubMainModuleClaims} from './SubMainModule/homeSubMainModuleClaims';
import {playerSubMainModuleClaims} from './SubMainModule/playerSubMainModuleClaims';
import {userManagementSubMainModuleClaims} from './SubMainModule/userManagementSubMainModuleClaims';
import {systemSubMainModuleClaims} from './SubMainModule/systemSubMainModuleClaims';
import {caseAndCommunicationSubMainModuleClaims} from './SubMainModule/caseAndCommunicationSubMainModuleClaims';
import {campaignSubMainModuleClaims} from './SubMainModule/campaignSubMainModuleClaims';
import {campaignWorkspaceSubMainModuleClaims} from './SubMainModule/campaignWorkspaceSubMainModuleClaims';
import {campaignDashBoardSubMainModuleClaims} from './SubMainModule/campaignDashBoardSubMainModuleClaims';
import {relationshipManagementSubMainModuleClaims} from './SubMainModule/relationShipManagementSubMainModuleClaims';
import {caseManagementSubMainModuleClaims} from './SubMainModule/caseManagementSubMainModuleClaims';
import {communicationReviewSubMainModuleClaims} from './SubMainModule/communicationReviewSubMainModuleClaims';
import {ticketsSubMainModuleClaims} from './SubMainModule/ticketsSubMainModuleClaims';
export const homeClaims = (userAccessId: number): MainModuleModel => {
	let homeClaimRead = $('#homeClaimRead');
	let homeClaimWrite = $('#homeClaimWrite');
	const homeMainModuleItems: MainModuleModel = {
		id: 1,
		description: SECURABLE_NAMES.Home,
		read: (homeClaimRead[0] as HTMLInputElement).checked,
		write: (homeClaimWrite[0] as HTMLInputElement).checked,
		subMainModuleDetails: homeSubMainModuleClaims(userAccessId),
		updatedBy: userAccessId,
		createdBy: userAccessId,
	};

	return homeMainModuleItems;
};

export const playerClaims = (userAccessId: number): MainModuleModel => {
	let playerClaimRead = $('#playerClaimRead');
	let playerClaimWrite = $('#playerClaimWrite');
	const playerMainModuleItems: MainModuleModel = {
		id: 2,
		description: SECURABLE_NAMES.Player,
		write: (playerClaimWrite[0] as HTMLInputElement).checked,
		read: (playerClaimRead[0] as HTMLInputElement).checked,
		subMainModuleDetails: playerSubMainModuleClaims(userAccessId),
		updatedBy: userAccessId,
		createdBy: userAccessId,
	};

	return playerMainModuleItems;
};

export const userManagementClaims = (userAccessId: number): MainModuleModel => {
	let userManagementClaimRead = $('#userManagementClaimRead');
	let userManagementClaimWrite = $('#userManagementClaimWrite');
	const userManagementItems: MainModuleModel = {
		id: 3,
		description: SECURABLE_NAMES.UserManagement,
		write: (userManagementClaimWrite[0] as HTMLInputElement).checked,
		read: (userManagementClaimRead[0] as HTMLInputElement).checked,
		subMainModuleDetails: userManagementSubMainModuleClaims(userAccessId),
		createdBy: userAccessId,
		updatedBy: userAccessId,
	};

	return userManagementItems;
};

export const systemClaims = (userAccessId: number): MainModuleModel => {
	let systemClaimRead = $('#systemClaimRead');
	let systemClaimWrite = $('#systemClaimWrite');
	const systemItems: MainModuleModel = {
		id: 4,
		description: SECURABLE_NAMES.System,
		write: (systemClaimWrite[0] as HTMLInputElement).checked,
		read: (systemClaimRead[0] as HTMLInputElement).checked,
		subMainModuleDetails: systemSubMainModuleClaims(userAccessId),
		createdBy: userAccessId,
		updatedBy: userAccessId,
	};

	return systemItems;
};

export const caseCommClaims = (userAccessId: number): MainModuleModel => {
	let caseAndCommunicationClaimRead = $('#caseAndCommunicationClaimRead');
	let caseAndCommunicationClaimWrite = $('#caseAndCommunicationClaimWrite');
	const caseAndCommunicationItems: MainModuleModel = {
		id: 6,
		description: SECURABLE_NAMES.CaseAndCommunication,
		read: (caseAndCommunicationClaimRead[0] as HTMLInputElement).checked,
		write: (caseAndCommunicationClaimWrite[0] as HTMLInputElement).checked,
		subMainModuleDetails: caseAndCommunicationSubMainModuleClaims(userAccessId),
		createdBy: userAccessId,
		updatedBy: userAccessId,
	};

	return caseAndCommunicationItems;
};

export const campaignClaims = (userAccessId: number): MainModuleModel => {
	let campaignClaimRead = $('#campaignClaimRead');
	let campaignClaimWrite = $('#campaignClaimWrite');
	const campaignItems: MainModuleModel = {
		id: 5,
		description: SECURABLE_NAMES.Campaign,
		read: (campaignClaimRead[0] as HTMLInputElement).checked,
		write: (campaignClaimWrite[0] as HTMLInputElement).checked,
		subMainModuleDetails: campaignSubMainModuleClaims(userAccessId),
		createdBy: userAccessId,
		updatedBy: userAccessId,
	};

	return campaignItems;
};

export const campaignWorkSpaceClaims = (userAccessId: number): MainModuleModel => {
	let campaignWorkspaceClaimRead = $('#campaignWorkspaceClaimRead');
	let campaignWorkspaceClaimWrite = $('#campaignWorkspaceClaimWrite');
	const campaignWorkspaceItems: MainModuleModel = {
		id: 7,
		description: SECURABLE_NAMES.CampaignWorkspace,
		read: (campaignWorkspaceClaimRead[0] as HTMLInputElement).checked,
		write: (campaignWorkspaceClaimWrite[0] as HTMLInputElement).checked,
		subMainModuleDetails: campaignWorkspaceSubMainModuleClaims(userAccessId),
		createdBy: userAccessId,
		updatedBy: userAccessId,
	};

	return campaignWorkspaceItems;
};

export const campaignDashBoardClaims = (userAccessId: number): MainModuleModel => {
	let campaignDashboardClaimRead = $('#campaignDashboardClaimRead');
	let campaignDashboardClaimWrite = $('#campaignDashboardClaimWrite');
	const campaignDashboardItems: MainModuleModel = {
		id: 8,
		description: SECURABLE_NAMES.CampaignDashboard,
		read: (campaignDashboardClaimRead[0] as HTMLInputElement).checked,
		write: (campaignDashboardClaimWrite[0] as HTMLInputElement).checked,
		subMainModuleDetails: campaignDashBoardSubMainModuleClaims(userAccessId),
		createdBy: userAccessId,
		updatedBy: userAccessId,
	};

	return campaignDashboardItems;
};

export const relationshipManagementClaims = (userAccessId: number): MainModuleModel => {
	let relationshipManagementClaimRead = $('#relationshipManagementClaimRead');
	let relationshipManagementClaimWrite = $('#relationshipManagementClaimWrite');
	const relationshipManagementItems: MainModuleModel = {
		id: 9,
		description: SECURABLE_NAMES.RelationshipManagement,
		read: (relationshipManagementClaimRead[0] as HTMLInputElement).checked,
		write: (relationshipManagementClaimWrite[0] as HTMLInputElement).checked,
		subMainModuleDetails: relationshipManagementSubMainModuleClaims(userAccessId),
		createdBy: userAccessId,
		updatedBy: userAccessId,
	};
	return relationshipManagementItems;
};

export const caseManagementClaims = (userAccessId: number): MainModuleModel => {
	let caseManagementClaimRead = $('#caseManagementClaimRead');
	let caseManagementClaimWrite = $('#caseManagementClaimWrite');
	const caseManagementItems: MainModuleModel = {
		id: 10,
		description: SECURABLE_NAMES.CaseManagement,
		read: (caseManagementClaimRead[0] as HTMLInputElement).checked,
		write: (caseManagementClaimWrite[0] as HTMLInputElement).checked,
		subMainModuleDetails: caseManagementSubMainModuleClaims(userAccessId),
		createdBy: userAccessId,
		updatedBy: userAccessId,
	};
	return caseManagementItems;
};

export const communicationReviewClaims = (userAccessId: number): MainModuleModel => {
	const communicationReviewClaimRead = document.getElementById('communicationReviewReadChkBox') as HTMLInputElement;
	const communicationReviewClaimWrite = document.getElementById('communicationReviewWriteChkBox') as HTMLInputElement;
	const communicationReviewItems: MainModuleModel = {
		id: MainModuleEnum.CommunicationReview,
		description: SECURABLE_NAMES.CommunicationReview,
		read: communicationReviewClaimRead.checked,
		write: communicationReviewClaimWrite.checked,
		subMainModuleDetails: communicationReviewSubMainModuleClaims(userAccessId),
		createdBy: userAccessId,
		updatedBy: userAccessId,
	};
	return communicationReviewItems;
};

export const ticketsClaims = (userAccessId: number): MainModuleModel => {
	const ticketsClaimRead = document.getElementById('ticketsClaimRead') as HTMLInputElement;
	const ticketsClaimWrite = document.getElementById('ticketsClaimWrite') as HTMLInputElement;
	const ticketsClaimItems: MainModuleModel = {
		id: 13,
		description: SECURABLE_NAMES.Tickets,
		read: ticketsClaimRead.checked,
		write: ticketsClaimWrite.checked,
		subMainModuleDetails: ticketsSubMainModuleClaims(userAccessId),
		createdBy: userAccessId,
		updatedBy: userAccessId,
	};
	return ticketsClaimItems;
};
