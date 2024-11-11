import {SubModuleDetailModel} from '../../../../../models/SubModuleDetailModel';
import {SECURABLE_NAMES} from '../../../../constants/SecurableNames';
import $ from 'jquery';

export const removeLeadsDetailClaim = (userAccessId: number): SubModuleDetailModel[] => {
	let removeLinkedPlayerClaimRead = $('#removeLinkedPlayerClaimRead');
	let removeLinkedPlayerClaimWrite = $('#removeLinkedPlayerClaimWrite');
	const removeLinkedPlayerClaim: SubModuleDetailModel = {
		id: 67,
		description: SECURABLE_NAMES.RemoveLinkedPlayer,
		write: (removeLinkedPlayerClaimWrite[0] as HTMLInputElement).checked,
		read: (removeLinkedPlayerClaimRead[0] as HTMLInputElement).checked,
		createdBy: userAccessId,
		updatedBy: userAccessId,
	};

	let removeLinkedPlayerClaimItems: SubModuleDetailModel[] = [removeLinkedPlayerClaim];

	return removeLinkedPlayerClaimItems;
};
