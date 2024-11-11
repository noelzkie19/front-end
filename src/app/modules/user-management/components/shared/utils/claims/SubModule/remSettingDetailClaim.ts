import { SubModuleDetailModel } from "../../../../../models/SubModuleDetailModel";
import { SECURABLE_IDS } from "../../../../constants/SecurableIdentifier";
import { SECURABLE_NAMES } from "../../../../constants/SecurableNames";
import $ from 'jquery'

export const remSettingDetailClaim = (userAccessId: number): SubModuleDetailModel[] => {

    let remAutoDistributionSettingClaimRead = $('#remAutoDistributionSettingClaimRead');
    let remAutoDistributionSettingClaimWrite = $('#remAutoDistributionSettingClaimWrite');
    const remAutoDistributionSettingClaim: SubModuleDetailModel = {
        id: SECURABLE_IDS.RemAutoDistributionSetting,
        description: SECURABLE_NAMES.RemAutoDistributionSetting,
        write: (remAutoDistributionSettingClaimWrite[0] as HTMLInputElement).checked,
        read: (remAutoDistributionSettingClaimRead[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };
  
    let remSettingDetailClaimItems: Array<SubModuleDetailModel> =  [remAutoDistributionSettingClaim];
  
    return remSettingDetailClaimItems
}