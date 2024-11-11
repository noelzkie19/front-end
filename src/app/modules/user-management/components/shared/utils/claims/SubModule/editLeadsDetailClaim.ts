import {SubModuleDetailModel} from '../../../../../models/SubModuleDetailModel';
import {SECURABLE_NAMES} from '../../../../constants/SecurableNames';
import $ from 'jquery';

export const editLeadsDetailClaim = (userAccessId: number): SubModuleDetailModel[] => {
	let editLinkedPlayerClaimRead = $('#editLinkedPlayerClaimRead');
	let editLinkedPlayerClaimWrite = $('#editLinkedPlayerClaimWrite');
	const editLinkedPlayerClaim: SubModuleDetailModel = {
		id: 66,
		description: SECURABLE_NAMES.EditLinkedPlayer,
		write: (editLinkedPlayerClaimWrite[0] as HTMLInputElement).checked,
		read: (editLinkedPlayerClaimRead[0] as HTMLInputElement).checked,
		createdBy: userAccessId,
		updatedBy: userAccessId,
	};

	let editLinkedPlayerItems: SubModuleDetailModel[] = [editLinkedPlayerClaim];

	return editLinkedPlayerItems;
};
