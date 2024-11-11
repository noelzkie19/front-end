import {SECURABLE_NAMES} from '../../../../constants/SecurableNames';
import $ from 'jquery';
import {SubMainModuleModel} from '../../../../../models/SubMainModuleModel';
import {segmentationDetailClaims} from '../SubModule/segmentationDetailClaims';
import {viewContactDetailLogClaim} from '../SubModule/viewContactDetailLogClaim';
import { SECURABLE_IDS } from '../../../../constants/SecurableIdentifier';

export const playerSubMainModuleClaims = (userAccessId: number): SubMainModuleModel[] => {
	let playerSearchClaimWrite = $('#playerSearchClaimWrite');
	let playerSearchClaimRead = $('#playerSearchClaimRead');
	const playerSearchClaim: SubMainModuleModel = {
		id: 3,
		description: SECURABLE_NAMES.PlayerSearch,
		write: (playerSearchClaimWrite[0] as HTMLInputElement).checked,
		read: (playerSearchClaimRead[0] as HTMLInputElement).checked,
		subModuleDetails: [],
		createdBy: userAccessId,
		updatedBy: userAccessId,
	};

	let uploadPlayerListClaimRead = $('#uploadPlayerListClaimRead');
	let uploadPlayerListClaimWrite = $('#uploadPlayerListClaimWrite');
	const uploadPlayerListClaim: SubMainModuleModel = {
		id: 4,
		description: SECURABLE_NAMES.ImportPlayerList,
		write: (uploadPlayerListClaimWrite[0] as HTMLInputElement).checked,
		read: (uploadPlayerListClaimRead[0] as HTMLInputElement).checked,
		subModuleDetails: [],
		createdBy: userAccessId,
		updatedBy: userAccessId,
	};

	let downloadSearchResultClaimRead = $('#downloadSearchResultClaimRead');
	let downloadSearchResultClaimWrite = $('#downloadSearchResultClaimWrite');
	const downloadSearchResultClaim: SubMainModuleModel = {
		id: 5,
		description: SECURABLE_NAMES.DownloadSearchResult,
		write: (downloadSearchResultClaimWrite[0] as HTMLInputElement).checked,
		read: (downloadSearchResultClaimRead[0] as HTMLInputElement).checked,
		subModuleDetails: [],
		createdBy: userAccessId,
		updatedBy: userAccessId,
	};

	let outputFilterTemplateClaimRead = $('#outputFilterTemplateClaimRead');
	let outputFilterTemplateClaimWrite = $('#outputFilterTemplateClaimWrite');
	const outputFilterTemplateClaim: SubMainModuleModel = {
		id: 6,
		description: SECURABLE_NAMES.OutputFilterTemplate,
		write: (outputFilterTemplateClaimWrite[0] as HTMLInputElement).checked,
		read: (outputFilterTemplateClaimRead[0] as HTMLInputElement).checked,
		subModuleDetails: [],
		createdBy: userAccessId,
		updatedBy: userAccessId,
	};

	let playerProfileClaimRead = $('#playerProfileClaimRead');
	let playerProfileClaimWrite = $('#playerProfileClaimWrite');
	const playerProfileClaim: SubMainModuleModel = {
		id: 7,
		description: SECURABLE_NAMES.PlayerProfile,
		write: (playerProfileClaimWrite[0] as HTMLInputElement).checked,
		read: (playerProfileClaimRead[0] as HTMLInputElement).checked,
		subModuleDetails: [],
		createdBy: userAccessId,
		updatedBy: userAccessId,
	};

	let segmentationRead = $('#segmentationClaimRead');
	let segmentationWrite = $('#segmentationClaimWrite');
	const segmentationClaim: SubMainModuleModel = {
		id: 16,
		description: SECURABLE_NAMES.Segmentation,
		write: (segmentationWrite[0] as HTMLInputElement).checked,
		read: (segmentationRead[0] as HTMLInputElement).checked,
		subModuleDetails: segmentationDetailClaims(userAccessId),
		createdBy: userAccessId,
		updatedBy: userAccessId,
	};

	let viewContactDetailsLogClaimRead = $('#viewContactDetailsLogClaimRead');
	let viewContactDetailsLogClaimWrite = $('#viewContactDetailsLogClaimWrite');
	const viewContactDetailsLogClaim: SubMainModuleModel = {
		id: 28,
		description: SECURABLE_NAMES.ViewContactDetailsLog,
		write: (viewContactDetailsLogClaimWrite[0] as HTMLInputElement).checked,
		read: (viewContactDetailsLogClaimRead[0] as HTMLInputElement).checked,
		subModuleDetails: viewContactDetailLogClaim(userAccessId),
		createdBy: userAccessId,
		updatedBy: userAccessId,
	};

	let exportLogtoCSVClaimRead = $('#exportLogtoCSVClaimRead');
	let exportLogtoCSVClaimWrite = $('#exportLogtoCSVClaimWrite');
	const exportLogtoCSVClaim: SubMainModuleModel = {
		id: 29,
		description: SECURABLE_NAMES.ExportLogtoCSV,
		write: (exportLogtoCSVClaimWrite[0] as HTMLInputElement).checked,
		read: (exportLogtoCSVClaimRead[0] as HTMLInputElement).checked,
		subModuleDetails: [],
		updatedBy: userAccessId,
		createdBy: userAccessId,
	};

	let viewSensitiveDataClaimWrite = $('#viewSensitiveDataClaimWrite');
	let viewSensitiveDataClaimRead = $('#viewSensitiveDataClaimRead');
	const viewSensitiveDataClaim: SubMainModuleModel = {
		id: 45,
		description: SECURABLE_NAMES.ExportLogtoCSV,
		write: (viewSensitiveDataClaimWrite[0] as HTMLInputElement).checked,
		read: (viewSensitiveDataClaimRead[0] as HTMLInputElement).checked,
		subModuleDetails: [],
		updatedBy: userAccessId,
		createdBy: userAccessId,
	};

	let searchLeadsClaimWrite = $('#searchLeadsClaimWrite');
	let searchLeadsClaimRead = $('#searchLeadsClaimRead');

	const searchLeadsClaim: SubMainModuleModel = {
		id: 59,
		description: SECURABLE_NAMES.SearchLeads,
		write: (searchLeadsClaimWrite[0] as HTMLInputElement).checked,
		read: (searchLeadsClaimRead[0] as HTMLInputElement).checked,
		// subModuleDetails: searchLeadsDetailClaims(userAccessId),
		subModuleDetails: [],
		updatedBy: userAccessId,
		createdBy: userAccessId,
	};

	let viewContactDetailsClaimRead = $('#viewContactDetailsClaimRead');
	let viewContactDetailsClaimWrite = $('#viewContactDetailsClaimWrite');
	const viewContactDetailsClaim: SubMainModuleModel = {
		id: SECURABLE_IDS.ViewContactDetails,
		description: SECURABLE_NAMES.ViewContactDetails,
		write: (viewContactDetailsClaimWrite[0] as HTMLInputElement).checked,
		read: (viewContactDetailsClaimRead[0] as HTMLInputElement).checked,
		subModuleDetails: [],
		createdBy: userAccessId,
		updatedBy: userAccessId,
	};

	let playerSubMainModuleItems: Array<SubMainModuleModel> = [
		playerSearchClaim,
		uploadPlayerListClaim,
		downloadSearchResultClaim,
		outputFilterTemplateClaim,
		playerProfileClaim,
		segmentationClaim,
		viewContactDetailsLogClaim,
		exportLogtoCSVClaim,
		viewSensitiveDataClaim,
		searchLeadsClaim,
		viewContactDetailsClaim
	];

	return playerSubMainModuleItems;
};
