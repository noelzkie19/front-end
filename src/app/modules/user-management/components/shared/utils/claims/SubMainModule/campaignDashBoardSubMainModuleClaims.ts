import { SECURABLE_NAMES } from "../../../../constants/SecurableNames";
import $ from 'jquery'
import { SubMainModuleModel } from "../../../../../models/SubMainModuleModel";

export const campaignDashBoardSubMainModuleClaims = (userAccessId: number): SubMainModuleModel[] => {
    let surveyAndFeedbackClaimRead = $('#surveyAndFeedbackClaimRead');
    let surveyAndFeedbackClaimWrite = $('#surveyAndFeedbackClaimWrite');
    const surveyAndFeedbackClaim: SubMainModuleModel = {
        id: 30,
        description: SECURABLE_NAMES.SurveyAndFeedback,
        read: (surveyAndFeedbackClaimRead[0] as HTMLInputElement).checked,
        write: (surveyAndFeedbackClaimWrite[0] as HTMLInputElement).checked,
        subModuleDetails: [],
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let campaignPerformanceClaimRead = $('#campaignPerformanceClaimRead');
    let campaignPerformanceClaimWrite = $('#campaignPerformanceClaimWrite');
    const campaignPerformanceClaim: SubMainModuleModel = {
        id: 31,
        description: SECURABLE_NAMES.CampaignPerformance,
        read: (campaignPerformanceClaimRead[0] as HTMLInputElement).checked,
        write: (campaignPerformanceClaimWrite[0] as HTMLInputElement).checked,
        subModuleDetails: [],
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let campaignDashboardSubMainModuleItems: Array<SubMainModuleModel> = [surveyAndFeedbackClaim, campaignPerformanceClaim];

    return campaignDashboardSubMainModuleItems
}
