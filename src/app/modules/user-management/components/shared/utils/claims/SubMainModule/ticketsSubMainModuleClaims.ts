import { SECURABLE_NAMES } from '../../../../constants/SecurableNames';
import { SECURABLE_IDS } from '../../../../constants/SecurableIdentifier';
import $ from 'jquery';
import { SubMainModuleModel } from '../../../../../models/SubMainModuleModel';
import { missingDepositDetailClaim } from '../SubModule/manageTicketsDetailClaim';
import { missingWithdrawalDetailClaim } from '../SubModule/manageWithdrawalDetailClaim';

export const ticketsSubMainModuleClaims = (userAccessId: number): SubMainModuleModel[] => {
	let manageTicketsClaimRead = $('#manageTicketsClaimRead');
	let manageTicketsClaimWrite = $('#manageTicketsClaimWrite');
	
	const manageTicketsClaim: SubMainModuleModel = {
		id: SECURABLE_IDS.ManageTicket,
		description: SECURABLE_NAMES.ManageTickets,
		read: (manageTicketsClaimRead[0] as HTMLInputElement).checked,
		write: (manageTicketsClaimWrite[0] as HTMLInputElement).checked,
		subModuleDetails: [],
		createdBy: userAccessId,
		updatedBy: userAccessId,
	};

	let missingDepositClaimRead = $('#missingDepositClaimRead');
	let missingDepositClaimWrite = $('#missingDepositClaimWrite');

	const missingDepositsClaim: SubMainModuleModel = {
		id: SECURABLE_IDS.MissingDeposit,
		description: SECURABLE_NAMES.MissingDeposit,
		read: (missingDepositClaimRead[0] as HTMLInputElement).checked,
		write: (missingDepositClaimWrite[0] as HTMLInputElement).checked,
		subModuleDetails: missingDepositDetailClaim(userAccessId),
		createdBy: userAccessId,
		updatedBy: userAccessId,
	};

	let missingWithdrawalClaimRead = $('#missingWithdrawalClaimRead');
	let missingWithdrawalClaimWrite = $('#missingWithdrawalClaimWrite');

	const missingWithdrawalClaim: SubMainModuleModel = {
		id: SECURABLE_IDS.MissingWithdrawal,
		description: SECURABLE_NAMES.MissingWithdrawal,
		read: (missingWithdrawalClaimRead[0] as HTMLInputElement).checked,
		write: (missingWithdrawalClaimWrite[0] as HTMLInputElement).checked,
		subModuleDetails: missingWithdrawalDetailClaim(userAccessId),
		createdBy: userAccessId,
		updatedBy: userAccessId,
	};

	let issueClaimRead = $('#issueClaimRead');
	let issueClaimWrite = $('#issueClaimWrite');

	const issueClaim: SubMainModuleModel = {
		id: SECURABLE_IDS.TicketIssue,
		description: SECURABLE_NAMES.TicketIssue,
		read: (issueClaimRead[0] as HTMLInputElement).checked,
		write: (issueClaimWrite[0] as HTMLInputElement).checked,
		subModuleDetails: [],
		createdBy: userAccessId,
		updatedBy: userAccessId,
	};


	let taskClaimRead = $('#taskClaimRead');
	let taskClaimWrite = $('#taskClaimWrite');

	const taskClaim: SubMainModuleModel = {
		id: SECURABLE_IDS.TicketTask,
		description: SECURABLE_NAMES.TicketTask,
		read: (taskClaimRead[0] as HTMLInputElement).checked,
		write: (taskClaimWrite[0] as HTMLInputElement).checked,
		subModuleDetails: [],
		createdBy: userAccessId,
		updatedBy: userAccessId,
	};

	let ticketsSubMainModuleItems: Array<SubMainModuleModel> = [manageTicketsClaim , missingDepositsClaim, missingWithdrawalClaim, issueClaim, taskClaim];

	return ticketsSubMainModuleItems;
};
