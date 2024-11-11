import { SubModuleDetailModel } from "../../../../../models/SubModuleDetailModel";
import $ from 'jquery'
import { SECURABLE_NAMES } from "../../../../constants/SecurableNames";

export const manageCampaignDetailClaim = (userAccessId: number): SubModuleDetailModel[] => {
    let searchCampaignClaimRead = $('#searchCampaignClaimRead');
    let searchCampaignClaimWrite = $('#searchCampaignClaimWrite');
    const searchCampaignClaim: SubModuleDetailModel = {
        id: 22,
        description: SECURABLE_NAMES.SearchCampaign,
        read: (searchCampaignClaimRead[0] as HTMLInputElement).checked,
        write: (searchCampaignClaimWrite[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let createCampaignClaimRead = $('#createCampaignClaimRead');
    let createCampaignClaimWrite = $('#createCampaignClaimWrite');
    const createCampaignClaim: SubModuleDetailModel = {
        id: 23,
        description: SECURABLE_NAMES.CreateCampaign,
        read: (createCampaignClaimRead[0] as HTMLInputElement).checked,
        write: (createCampaignClaimWrite[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let editCampaignClaimRead = $('#editCampaignClaimRead');
    let editCampaignClaimWrite = $('#editCampaignClaimWrite');
    const editCampaignClaim: SubModuleDetailModel = {
        id: 24,
        description: SECURABLE_NAMES.EditCampaign,
        read: (editCampaignClaimRead[0] as HTMLInputElement).checked,
        write: (editCampaignClaimWrite[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let viewCampaignClaimRead = $('#viewCampaignClaimRead');
    let viewCampaignClaimWrite = $('#viewCampaignClaimWrite');
    const viewCampaignClaim: SubModuleDetailModel = {
        id: 25,
        description: SECURABLE_NAMES.ViewCampaign,
        read: (viewCampaignClaimRead[0] as HTMLInputElement).checked,
        write: (viewCampaignClaimWrite[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let holdCampaignClaimRead = $('#holdCampaignClaimRead');
    let holdCampaignClaimWrite = $('#holdCampaignClaimWrite');
    const holdCampaignClaim: SubModuleDetailModel = {
        id: 26,
        description: SECURABLE_NAMES.HoldCampaign,
        read: (holdCampaignClaimRead[0] as HTMLInputElement).checked,
        write: (holdCampaignClaimWrite[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let manageCampaignDetailItems: Array<SubModuleDetailModel> =
        [searchCampaignClaim, createCampaignClaim, editCampaignClaim,
            viewCampaignClaim, holdCampaignClaim];

    return manageCampaignDetailItems
}