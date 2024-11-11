import { SubModuleDetailModel } from "../../../../../models/SubModuleDetailModel";
import $ from 'jquery'
import { SECURABLE_NAMES } from "../../../../constants/SecurableNames";

export const viewContactDetailLogClaim = (userAccessId: number): SubModuleDetailModel[] => {
    let manageThresholdClaimRead = $('#manageThresholdClaimRead');
    let manageThresholdClaimWrite = $('#manageThresholdClaimWrite');
    const manageThresholdClaim: SubModuleDetailModel = {
        id: 37,
        description: SECURABLE_NAMES.ManageThreshold,
        write: (manageThresholdClaimWrite[0] as HTMLInputElement).checked,
        read: (manageThresholdClaimRead[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let viewContactDetailsLogItems: Array<SubModuleDetailModel> = [manageThresholdClaim];

    return viewContactDetailsLogItems
}