import { SECURABLE_NAMES } from "../../../../constants/SecurableNames";
import $ from 'jquery'
import { SubMainModuleModel } from "../../../../../models/SubMainModuleModel";

export const homeSubMainModuleClaims = (userAccessId: number): SubMainModuleModel[] => {
    let playerEngagementClaimRead = $('#playerEngagementClaimRead');
    let playerEngagementClaimWrite = $('#playerEngagementClaimWrite');
    const playerEngagementClaim: SubMainModuleModel = {
        id: 1,
        description: SECURABLE_NAMES.PlayerEngagement,
        read: (playerEngagementClaimRead[0] as HTMLInputElement).checked,
        write: (playerEngagementClaimWrite[0] as HTMLInputElement).checked,
        subModuleDetails: [],
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let marketingClaimRead = $('#marketingClaimRead');
    let marketingClaimWrite = $('#marketingClaimWrite')
    const marketingClaim: SubMainModuleModel = {
        id: 2,
        description: SECURABLE_NAMES.Marketing,
        read: (marketingClaimRead[0] as HTMLInputElement).checked,
        write: (marketingClaimWrite[0] as HTMLInputElement).checked,
        subModuleDetails: [],
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let homeSubMainModuleItems: Array<SubMainModuleModel> = [playerEngagementClaim, marketingClaim]

    return homeSubMainModuleItems
}