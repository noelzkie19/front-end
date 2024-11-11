import $ from 'jquery';
import {SubModuleDetailModel} from "../../../../../models/SubModuleDetailModel";
import {SECURABLE_NAMES} from "../../../../constants/SecurableNames";

export const campaignSettingDetailClaim = (userAccessId: number): SubModuleDetailModel[] => {
    let searchGoalSettingClaimRead = $('#searchGoalSettingClaimRead');
    let searchGoalSettingClaimWrite = $('#searchGoalSettingClaimWrite');
    const searchGoalSettingItems: SubModuleDetailModel = {
        id: 12,
        description: SECURABLE_NAMES.SearchGoalSetting,
        read: (searchGoalSettingClaimRead[0] as HTMLInputElement).checked,
        write: (searchGoalSettingClaimWrite[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let updateGoalSettingClaimRead = $('#updateGoalSettingClaimRead');
    let updateGoalSettingClaimWrite = $('#updateGoalSettingClaimWrite');
    const updateGoalSettingClaim: SubModuleDetailModel = {
        id: 13,
        description: SECURABLE_NAMES.UpdateGoalSetting,
        read: (updateGoalSettingClaimRead[0] as HTMLInputElement).checked,
        write: (updateGoalSettingClaimWrite[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let viewGoalSettingClaimRead = $('#viewGoalSettingClaimRead');
    let viewGoalSettingClaimWrite = $('#viewGoalSettingClaimWrite');
    const viewGoalSettingClaim: SubModuleDetailModel = {
        id: 14,
        description: SECURABLE_NAMES.ViewGoalSetting,
        read: (viewGoalSettingClaimRead[0] as HTMLInputElement).checked,
        write: (viewGoalSettingClaimWrite[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let searchAutoTaggingClaimRead = $('#searchAutoTaggingClaimRead');
    let searchAutoTaggingClaimWrite = $('#searchAutoTaggingClaimWrite');
    const searchAutoTaggingClaim: SubModuleDetailModel = {
        id: 15,
        description: SECURABLE_NAMES.SearchAutoTagging,
        read: (searchAutoTaggingClaimRead[0] as HTMLInputElement).checked,
        write: (searchAutoTaggingClaimWrite[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let updateAutoTaggingClaimRead = $('#updateAutoTaggingClaimRead');
    let updateAutoTaggingClaimWrite = $('#updateAutoTaggingClaimWrite');
    const updateAutoTaggingClaim: SubModuleDetailModel = {
        id: 16,
        description: SECURABLE_NAMES.UpdateAutoTagging,
        read: (updateAutoTaggingClaimRead[0] as HTMLInputElement).checked,
        write: (updateAutoTaggingClaimWrite[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let viewAutoTaggingClaimRead = $('#viewAutoTaggingClaimRead');
    let viewAutoTaggingClaimWrite = $('#viewAutoTaggingClaimWrite');
    const viewAutoTaggingClaim: SubModuleDetailModel = {
        id: 17,
        description: SECURABLE_NAMES.ViewAutoTagging,
        read: (viewAutoTaggingClaimRead[0] as HTMLInputElement).checked,
        write: (viewAutoTaggingClaimWrite[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let incentiveGoalSettingClaimRead = $('#incentiveGoalSettingClaimRead');
    let incentiveGoalSettingClaimWrite = $('#incentiveGoalSettingClaimWrite');
    const incentiveGoalSettingClaim: SubModuleDetailModel = {
        id: 18,
        description: SECURABLE_NAMES.IncentiveGoalSetting,
        read: (incentiveGoalSettingClaimRead[0] as HTMLInputElement).checked,
        write: (incentiveGoalSettingClaimWrite[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let updateIncentiveSettingClaimRead = $('#updateIncentiveSettingClaimRead');
    let updateIncentiveSettingClaimWrite = $('#updateIncentiveSettingClaimWrite');
    const updateIncentiveSettingClaim: SubModuleDetailModel = {
        id: 19,
        description: SECURABLE_NAMES.UpdateIncentiveSetting,
        read: (updateIncentiveSettingClaimRead[0] as HTMLInputElement).checked,
        write: (updateIncentiveSettingClaimWrite[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let viewIncentiveSettingClaimRead = $('#viewIncentiveSettingClaimRead');
    let viewIncentiveSettingClaimWrite = $('#viewIncentiveSettingClaimWrite');
    const viewIncentiveSettingClaim: SubModuleDetailModel = {
        id: 20,
        description: SECURABLE_NAMES.ViewIncentiveSetting,
        read: (viewIncentiveSettingClaimRead[0] as HTMLInputElement).checked,
        write: (viewIncentiveSettingClaimWrite[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let agentForTaggingClaimRead = $('#agentForTaggingClaimRead');
    let agentForTaggingClaimWrite = $('#agentForTaggingClaimWrite');
    const agentForTaggingClaim: SubModuleDetailModel = {
        id: 21,
        description: SECURABLE_NAMES.AgentForTagging,
        read: (agentForTaggingClaimRead[0] as HTMLInputElement).checked,
        write: (agentForTaggingClaimWrite[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let customEventSettingClaimRead = $('#customEventSettingClaimRead');
    let customEventSettingClaimWrite = $('#customEventSettingClaimWrite');
    const customEventSettingEditClaim: SubModuleDetailModel = {
        id: 47,
        description: SECURABLE_NAMES.CustomEventSetting,
        read: (customEventSettingClaimRead[0] as HTMLInputElement).checked,
        write: (customEventSettingClaimWrite[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    
    let telegramBotClaimRead = $('#telegramBotClaimRead');
    let telegramBotClaimWrite = $('#telegramBotClaimWrite');
    const telegramBotClaim: SubModuleDetailModel = {
        id: 60,
        description: SECURABLE_NAMES.SearchTelegramBot,
        read: (telegramBotClaimRead[0] as HTMLInputElement).checked,
        write: (telegramBotClaimWrite[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let updateTelegramBotClaimRead = $('#updateTelegramBotClaimRead');
    let updateTelegramBotClaimWrite = $('#updateTelegramBotClaimWrite');
    const updateTelegramBotClaim: SubModuleDetailModel = {
        id: 61,
        description: SECURABLE_NAMES.UpdateTelegramBot,
        read: (updateTelegramBotClaimRead[0] as HTMLInputElement).checked,
        write: (updateTelegramBotClaimWrite[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let viewTelegramBotClaimRead = $('#viewTelegramBotClaimRead');
    let viewTelegramBotClaimWrite = $('#viewTelegramBotClaimWrite');
    const viewTelegramBotClaim: SubModuleDetailModel = {
        id: 62,
        description: SECURABLE_NAMES.ViewTelegramBot,
        read: (viewTelegramBotClaimRead[0] as HTMLInputElement).checked,
        write: (viewTelegramBotClaimWrite[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let campaignSettingDetailItems: Array<SubModuleDetailModel> =
        [searchGoalSettingItems, updateGoalSettingClaim, viewGoalSettingClaim,
            searchAutoTaggingClaim, updateAutoTaggingClaim, viewAutoTaggingClaim,
            incentiveGoalSettingClaim, updateIncentiveSettingClaim, viewIncentiveSettingClaim,
            agentForTaggingClaim, customEventSettingEditClaim,
            telegramBotClaim, updateTelegramBotClaim, viewTelegramBotClaim,];

    return campaignSettingDetailItems
}