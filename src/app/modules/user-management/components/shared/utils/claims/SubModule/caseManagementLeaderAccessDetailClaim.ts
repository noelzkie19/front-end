

import { SubModuleDetailModel } from "../../../../../models/SubModuleDetailModel";
import $ from 'jquery'
import { SECURABLE_NAMES } from "../../../../constants/SecurableNames";

export const caseManagementLeaderAccessDetailClaim = (userAccessId: number): SubModuleDetailModel[] => {
    let createCaseOnBehalfClaimRead = $('#createCaseOnBehalfClaimRead');
    let createCaseOnBehalfClaimWrite = $('#createCaseOnBehalfClaimWrite');
    const createCaseOnBehalfClaim: SubModuleDetailModel = {
        id: 56,
        description: SECURABLE_NAMES.CreateCaseOnBehalf,
        read: (createCaseOnBehalfClaimRead[0] as HTMLInputElement).checked,
        write: (createCaseOnBehalfClaimWrite[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let reopenCaseClaimRead = $('#reopenCaseClaimRead');
    let reopenCaseClaimWrite = $('#reopenCaseClaimWrite');
    const reopenCaseClaim: SubModuleDetailModel = {
        id: 57,
        description: SECURABLE_NAMES.ReopenCase,
        read: (reopenCaseClaimRead[0] as HTMLInputElement).checked,
        write: (reopenCaseClaimWrite[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };
    

    let caseManagementLeaderAccessDetailItems: Array<SubModuleDetailModel> =
        [createCaseOnBehalfClaim, reopenCaseClaim];

    return caseManagementLeaderAccessDetailItems
}