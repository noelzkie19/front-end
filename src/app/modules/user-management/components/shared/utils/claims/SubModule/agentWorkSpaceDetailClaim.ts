import { SubModuleDetailModel } from "../../../../../models/SubModuleDetailModel";
import $ from 'jquery'
import { SECURABLE_NAMES } from "../../../../constants/SecurableNames";

export const agentWorkSpaceDetailClaim = (userAccessId: number): SubModuleDetailModel[] => {
    let viewOwnPlayersClaimRead = $('#viewOwnPlayersClaimRead');
    let viewOwnPlayersClaimWrite = $('#viewOwnPlayersClaimWrite');
    const viewOwnPlayerClaim: SubModuleDetailModel = {
        id: 27,
        description: SECURABLE_NAMES.ViewOwnPlayers,
        read: (viewOwnPlayersClaimRead[0] as HTMLInputElement).checked,
        write: (viewOwnPlayersClaimWrite[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let viewAllPlayersClaimRead = $('#viewAllPlayersClaimRead');
    let viewAllPlayersClaimWrite = $('#viewAllPlayersClaimWrite');
    const viewAllPlayersClaim: SubModuleDetailModel = {
        id: 28,
        description: SECURABLE_NAMES.ViewAllPlayers,
        read: (viewAllPlayersClaimRead[0] as HTMLInputElement).checked,
        write: (viewAllPlayersClaimWrite[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let exportToCSVAgentWorkSpaceClaimRead = $('#exportToCSVAgentWorkSpaceClaimRead');
    let exportToCSVAgentWorkSpaceClaimWrite = $('#exportToCSVAgentWorkSpaceClaimWrite');
    const exportToCSVAgentWorkSpaceClaim: SubModuleDetailModel = {
        id: 36,
        description: SECURABLE_NAMES.ExportToCSVAgentWorkSpace,
        read: (exportToCSVAgentWorkSpaceClaimRead[0] as HTMLInputElement).checked, // check here
        write: (exportToCSVAgentWorkSpaceClaimWrite[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let agentWorkspaceDetailItems: Array<SubModuleDetailModel> =
        [viewOwnPlayerClaim, viewAllPlayersClaim, exportToCSVAgentWorkSpaceClaim];

    return agentWorkspaceDetailItems
}