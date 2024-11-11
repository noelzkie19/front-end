import { SECURABLE_NAMES } from "../../../../constants/SecurableNames";
import $ from 'jquery'
import { SubMainModuleModel } from "../../../../../models/SubMainModuleModel";
import { codeListDetailClaim } from "../SubModule/codeListDetailClaim";
import { playerConfigDetailClaim } from "../SubModule/playerConfigDetailClaim";
import {staffPerformanceDetailClaim} from "../SubModule/staffPerformanceDetailClaim";

export const systemSubMainModuleClaims = (userAccessId: number): SubMainModuleModel[] => {
    let operatorAndBrandClaimRead = $('#operatorAndBrandClaimRead');
    let operatorAndBrandClaimWrite = $('#operatorAndBrandClaimWrite');
    const operatorAndBrandItems: SubMainModuleModel = {
        id: 11,
        description: SECURABLE_NAMES.OperatorAndBrand,
        write: (operatorAndBrandClaimWrite[0] as HTMLInputElement).checked,
        read: (operatorAndBrandClaimRead[0] as HTMLInputElement).checked,
        subModuleDetails: [],
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let codeListClaimWrite = $('#codeListClaimWrite');
    let codeListClaimRead = $('#codeListClaimRead');
    const codeListClaim: SubMainModuleModel = {
        id: 12,
        description: SECURABLE_NAMES.CodeList,
        write: (codeListClaimWrite[0] as HTMLInputElement).checked,
        read: (codeListClaimRead[0] as HTMLInputElement).checked,
        subModuleDetails: codeListDetailClaim(userAccessId),
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let playerConfigurationClaimWrite = $('#playerConfigurationClaimWrite');
    let playerConfigurationClaimRead = $('#playerConfigurationClaimRead');
    const playerConfigurationClaim: SubMainModuleModel = {
        id: 13,
        description: SECURABLE_NAMES.PlayerConfiguration,
        write: (playerConfigurationClaimWrite[0] as HTMLInputElement).checked,
        read: (playerConfigurationClaimRead[0] as HTMLInputElement).checked,
        subModuleDetails: playerConfigDetailClaim(userAccessId),
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let surveyQuestionClaimRead = $('#surveyQuestionClaimRead');
    let surveyQuestionClaimWrite = $('#surveyQuestionClaimWrite');
    const surveyQuestionClaim: SubMainModuleModel = {
        id: 14,
        description: SECURABLE_NAMES.SurveyQuestion,
        write: (surveyQuestionClaimWrite[0] as HTMLInputElement).checked,
        read: (surveyQuestionClaimRead[0] as HTMLInputElement).checked,
        subModuleDetails: [],
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let surveyTemplateClaimRead = $('#surveyTemplateClaimRead');
    let surveyTemplateClaimWrite = $('#surveyTemplateClaimWrite');
    const surveyTemplateClaim: SubMainModuleModel = {
        id: 15,
        description: SECURABLE_NAMES.SurveyTemplate,
        read: (surveyTemplateClaimRead[0] as HTMLInputElement).checked,
        write: (surveyTemplateClaimWrite[0] as HTMLInputElement).checked,
        subModuleDetails: [],
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let skillMappingClaimRead = $('#skillMappingClaimRead');
    let skillMappingClaimWrite = $('#skillMappingClaimWrite');
    const skillMappingClaim: SubMainModuleModel = {
        id: 36,
        description: SECURABLE_NAMES.SkillMapping,
        read: (skillMappingClaimRead[0] as HTMLInputElement).checked,
        write: (skillMappingClaimWrite[0] as HTMLInputElement).checked,
        subModuleDetails: [],
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let postChatSurveyClaimRead = $('#postChatSurveyClaimRead');
    let postChatSurveyClaimWrite = $('#postChatSurveyClaimWrite');
    const postChatSurveyClaim: SubMainModuleModel = {
        id: 37,
        description: SECURABLE_NAMES.PostChatSurvey,
        write: (postChatSurveyClaimWrite[0] as HTMLInputElement).checked,
        read: (postChatSurveyClaimRead[0] as HTMLInputElement).checked,
        subModuleDetails: [],
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let staffPerformanceClaimRead = $('#staffPerformanceClaimRead');
    let staffPerformanceClaimWrite = $('#staffPerformanceClaimWrite');
    const staffPerformanceClaim: SubMainModuleModel = {
        id: 65,
        description: SECURABLE_NAMES.StaffPerformance,
        write: (staffPerformanceClaimWrite[0] as HTMLInputElement).checked,
        read: (staffPerformanceClaimRead[0] as HTMLInputElement).checked,
        subModuleDetails: staffPerformanceDetailClaim(userAccessId),
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let systemSubMainModuleItems: Array<SubMainModuleModel> =
        [operatorAndBrandItems, codeListClaim, playerConfigurationClaim,
            surveyQuestionClaim, surveyTemplateClaim, skillMappingClaim,
            postChatSurveyClaim, staffPerformanceClaim];

    return systemSubMainModuleItems
}