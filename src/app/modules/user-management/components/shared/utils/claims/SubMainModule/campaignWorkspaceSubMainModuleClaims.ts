import { SECURABLE_NAMES } from "../../../../constants/SecurableNames";
import $ from 'jquery'
import { SubMainModuleModel } from "../../../../../models/SubMainModuleModel";
import { agentWorkSpaceDetailClaim } from "../SubModule/agentWorkSpaceDetailClaim";
import { callListValidationDetailClaim } from "../SubModule/callListValidationDetailClaim";
import { agentMonitoringDetailClaim } from "../SubModule/agentMonitoringDetailClaim";

export const campaignWorkspaceSubMainModuleClaims = (userAccessId: number): SubMainModuleModel[] => {
    let agentWorkSpaceClaimRead = $('#agentWorkSpaceClaimRead');
    let agentWorkSpaceClaimWrite = $('#agentWorkSpaceClaimWrite');
    const agentWorkSpaceClaim: SubMainModuleModel = {
        id: 24,
        description: SECURABLE_NAMES.AgentWorkSpace,
        read: (agentWorkSpaceClaimRead[0] as HTMLInputElement).checked,
        write: (agentWorkSpaceClaimWrite[0] as HTMLInputElement).checked,
        subModuleDetails: agentWorkSpaceDetailClaim(userAccessId),
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let callListValidationClaimRead = $('#callListValidationClaimRead');
    let callListValidationClaimWrite = $('#callListValidationClaimWrite');
    const callListValidationClaim: SubMainModuleModel = {
        id: 25,
        description: SECURABLE_NAMES.CallListValidation,
        read: (callListValidationClaimRead[0] as HTMLInputElement).checked,
        write: (callListValidationClaimWrite[0] as HTMLInputElement).checked,
        subModuleDetails: callListValidationDetailClaim(userAccessId),
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let agentMonitoringClaimRead = $('#agentMonitoringClaimRead');
    let agentMonitoringClaimWrite = $('#agentMonitoringClaimWrite');
    const agentMonitoringClaim: SubMainModuleModel = {
        id: 26,
        description: SECURABLE_NAMES.AgentMonitoring,
        read: (agentMonitoringClaimRead[0] as HTMLInputElement).checked,
        write: (agentMonitoringClaimWrite[0] as HTMLInputElement).checked,
        subModuleDetails: agentMonitoringDetailClaim(userAccessId),
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let campaignSubMainModuleItems: Array<SubMainModuleModel> =
        [agentWorkSpaceClaim, callListValidationClaim, agentMonitoringClaim];

    return campaignSubMainModuleItems
}