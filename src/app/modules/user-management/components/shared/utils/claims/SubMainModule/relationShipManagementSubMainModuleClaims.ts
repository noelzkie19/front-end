import { SECURABLE_NAMES } from "../../../../constants/SecurableNames";
import $ from 'jquery'
import { SubMainModuleModel } from "../../../../../models/SubMainModuleModel";
import { remSettingDetailClaim } from "../SubModule/remSettingDetailClaim";

export const relationshipManagementSubMainModuleClaims = (userAccessId: number): SubMainModuleModel[] => {
    let remDistributionClaimWrite = $('#remDistributionClaimWrite');
    let remDistributionClaimRead = $('#remDistributionClaimRead');
    const remDistributionClaim: SubMainModuleModel = {
        id: 32,
        description: SECURABLE_NAMES.RemDistribution,
        read: (remDistributionClaimRead[0] as HTMLInputElement).checked,
        write: (remDistributionClaimWrite[0] as HTMLInputElement).checked,
        subModuleDetails: [],
        updatedBy: userAccessId,
        createdBy: userAccessId,
    };

    let remSettingClaimRead = $('#remSettingClaimRead');
    let remSettingClaimWrite = $('#remSettingClaimWrite');
    const remSettingClaim: SubMainModuleModel = {
        id: 34,
        description: SECURABLE_NAMES.RemSetting,
        read: (remSettingClaimRead[0] as HTMLInputElement).checked,
        write: (remSettingClaimWrite[0] as HTMLInputElement).checked,
        subModuleDetails: remSettingDetailClaim(userAccessId),
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let remProfileClaimRead = $('#remProfileClaimRead');
    let remProfileClaimWrite = $('#remProfileClaimWrite');
    const remProfileClaim: SubMainModuleModel = {
        id: 33,
        description: SECURABLE_NAMES.RemProfile,
        read: (remProfileClaimRead[0] as HTMLInputElement).checked,
        write: (remProfileClaimWrite[0] as HTMLInputElement).checked,
        subModuleDetails: [],
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let relationshipManagementSubMainModuleItems: Array<SubMainModuleModel> =
     [remDistributionClaim, remSettingClaim, remProfileClaim];

     return relationshipManagementSubMainModuleItems
}
