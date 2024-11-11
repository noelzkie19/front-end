import { SubModuleDetailModel } from "../../../../../models/SubModuleDetailModel";
import $ from 'jquery'
import { SECURABLE_NAMES } from "../../../../constants/SecurableNames";

export const callListValidationDetailClaim = (userAccessId: number): SubModuleDetailModel[] => {
    let viewCallListAllPlayersClaimRead = $('#viewCallListAllPlayersClaimRead');
    let viewCallListAllPlayersClaimWrite = $('#viewCallListAllPlayersClaimWrite');
    const viewCallListAllPlayersClaim: SubModuleDetailModel = {
        id: 29,
        description: SECURABLE_NAMES.ViewCallListAllPlayers,
        read: (viewCallListAllPlayersClaimRead[0] as HTMLInputElement).checked,
        write: (viewCallListAllPlayersClaimWrite[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let updateAllAgentValidationsClaimRead = $('#updateAllAgentValidationsClaimRead');
    let updateAllAgentValidationsClaimWrite = $('#updateAllAgentValidationsClaimWrite');
    const updateAllAgentValidationsClaim: SubModuleDetailModel = {
        id: 30,
        description: SECURABLE_NAMES.UpdateAllAgentValidations,
        read: (updateAllAgentValidationsClaimRead[0] as HTMLInputElement).checked,
        write: (updateAllAgentValidationsClaimWrite[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let updateLeaderValidationClaimRead = $('#updateLeaderValidationClaimRead');
    let updateLeaderValidationClaimWrite = $('#updateLeaderValidationClaimWrite');
    const updateLeaderValidationClaim: SubModuleDetailModel = {
        id: 31,
        description: SECURABLE_NAMES.UpdateLeaderValidation,
        read: (updateLeaderValidationClaimRead[0] as HTMLInputElement).checked,
        write: (updateLeaderValidationClaimWrite[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let updateCallEvaluationClaimRead = $('#updateCallEvaluationClaimRead');
    let updateCallEvaluationClaimWrite = $('#updateCallEvaluationClaimWrite');
    const updateCallEvaluationClaim: SubModuleDetailModel = {
        id: 32,
        description: SECURABLE_NAMES.UpdateCallEvaluation,
        read: (updateCallEvaluationClaimRead[0] as HTMLInputElement).checked,
        write: (updateCallEvaluationClaimWrite[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let exportToCSVCallListClaimRead = $('#exportToCSVCallListClaimRead');
    let exportToCSVCallListClaimWrite = $('#exportToCSVCallListClaimWrite');
    const exportToCSVCallListClaim: SubModuleDetailModel = {
        id: 35,
        description: SECURABLE_NAMES.ExportToCSVCallList,
        read: (exportToCSVCallListClaimRead[0] as HTMLInputElement).checked,
        write: (exportToCSVCallListClaimWrite[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };
    let callListValidationDetailItems: Array<SubModuleDetailModel> =
        [viewCallListAllPlayersClaim, updateAllAgentValidationsClaim, updateLeaderValidationClaim,
            updateCallEvaluationClaim, exportToCSVCallListClaim];

    return callListValidationDetailItems
}