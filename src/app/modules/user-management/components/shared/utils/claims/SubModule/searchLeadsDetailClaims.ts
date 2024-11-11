import {SubModuleDetailModel} from '../../../../../models/SubModuleDetailModel';
import $ from 'jquery';
import {SECURABLE_NAMES} from '../../../../constants/SecurableNames';

export const searchLeadsDetailClaims = (userAccessId: number): SubModuleDetailModel[] => {
	let editLinkedPlayerClaimRead = $('#editLinkedPlayerClaimRead');
	let editLinkedPlayerClaimWrite = $('#editLinkedPlayerClaimWrite');
	const editlinkPlayerClaim: SubModuleDetailModel = {
		id: 66,
		description: SECURABLE_NAMES.LinkToPlayer,
		write: (editLinkedPlayerClaimWrite[0] as HTMLInputElement).checked,
		read: (editLinkedPlayerClaimRead[0] as HTMLInputElement).checked,
		createdBy: userAccessId,
		updatedBy: userAccessId,
	};

	let removeLeadsClaimRead = $('#removeLeadsClaimRead');
	let removeLeadsClaimWrite = $('#removeLeadsClaimWrite');
	const removeLeadsClaim: SubModuleDetailModel = {
		id: 71,
		description: SECURABLE_NAMES.UnlinkAPlayer,
		write: (removeLeadsClaimWrite[0] as HTMLInputElement).checked,
		read: (removeLeadsClaimRead[0] as HTMLInputElement).checked,
		createdBy: userAccessId,
		updatedBy: userAccessId,
	};

	let searchLeadsDetailItems: SubModuleDetailModel[] = [editlinkPlayerClaim, removeLeadsClaim];

	return searchLeadsDetailItems;
};
