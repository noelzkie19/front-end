import { SubModuleDetailModel } from "../../../../../models/SubModuleDetailModel";
import $ from 'jquery'
import { SECURABLE_NAMES } from "../../../../constants/SecurableNames";

export const agentMonitoringDetailClaim = (userAccessId: number): SubModuleDetailModel[] => {

    let updateAgentStatusClaimRead = $('#updateAgentStatusClaimRead');
    let updateAgentStatusClaimWrite = $('#updateAgentStatusClaimWrite');
    const updateAgentStatusClaim: SubModuleDetailModel = {
        id: 33,
        description: SECURABLE_NAMES.UpdateAgentStatus,
        read: (updateAgentStatusClaimRead[0] as HTMLInputElement).checked,
        write: (updateAgentStatusClaimWrite[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let updateDailyReportClaimRead = $('#updateDailyReportClaimRead');
    let updateDailyReportClaimWrite = $('#updateDailyReportClaimWrite');
    const updateDailyReportClaim: SubModuleDetailModel = {
        id: 34,
        description: SECURABLE_NAMES.UpdateDailyReport,
        read: (updateDailyReportClaimRead[0] as HTMLInputElement).checked,
        write: (updateDailyReportClaimWrite[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let agentMonitoringDetailItems: Array<SubModuleDetailModel> = [updateAgentStatusClaim, updateDailyReportClaim];

    return agentMonitoringDetailItems
}