import { SubModuleDetailModel } from "../../../../../models/SubModuleDetailModel";
import $ from 'jquery'
import { SECURABLE_NAMES } from "../../../../constants/SecurableNames";

export const manageJourneyDetailClaim = (userAccessId: number): SubModuleDetailModel[] => {
    let searchJourneyClaimRead = $('#searchJourneyClaimRead');
		let searchJourneyClaimWrite = $('#searchJourneyClaimWrite');
    const searchJourneyClaim: SubModuleDetailModel = {
        id: 48,
        description: SECURABLE_NAMES.SearchJourney,
        read: (searchJourneyClaimRead[0] as HTMLInputElement).checked,
        write: (searchJourneyClaimWrite[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let createJourneyClaimRead = $('#createJourneyClaimRead');
		let createJourneyClaimWrite = $('#createJourneyClaimWrite');
        const createJourneyClaim: SubModuleDetailModel = {
			id: 49,
			description: SECURABLE_NAMES.CreateJourney,
			read: (createJourneyClaimRead[0] as HTMLInputElement).checked,
			write: (createJourneyClaimWrite[0] as HTMLInputElement).checked,
			createdBy: userAccessId,
			updatedBy: userAccessId,
		};

		let editJourneyClaimRead = $('#editJourneyClaimRead');
		let editJourneyClaimWrite = $('#editJourneyClaimWrite');
        const editJourneyClaim: SubModuleDetailModel = {
			id: 50,
			description: SECURABLE_NAMES.EditJourney,
			read: (editJourneyClaimRead[0] as HTMLInputElement).checked,
			write: (editJourneyClaimWrite[0] as HTMLInputElement).checked,
			createdBy: userAccessId,
			updatedBy: userAccessId,
		};

		let viewJourneyClaimRead = $('#viewJourneyClaimRead');
		let viewJourneyClaimWrite = $('#viewJourneyClaimWrite');
        const viewJourneyClaim: SubModuleDetailModel = {
			id: 51,
			description: SECURABLE_NAMES.ViewJourney,
			read: (viewJourneyClaimRead[0] as HTMLInputElement).checked,
			write: (viewJourneyClaimWrite[0] as HTMLInputElement).checked,
			createdBy: userAccessId,
			updatedBy: userAccessId,
		};

    let manageCampaignDetailItems: Array<SubModuleDetailModel> =
        [searchJourneyClaim, createJourneyClaim, editJourneyClaim, viewJourneyClaim];

    return manageCampaignDetailItems
}