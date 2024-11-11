import { SECURABLE_NAMES } from "../../../../constants/SecurableNames";
import $ from 'jquery'
import { SubMainModuleModel } from "../../../../../models/SubMainModuleModel";
import { campaignSettingDetailClaim } from "../SubModule/campaignSettingDetailClaim";
import { manageCampaignDetailClaim } from "../SubModule/manageCampaignDetailClaim";
import { manageJourneyDetailClaim } from "../SubModule/manageJourneyDetailClaim";

export const campaignSubMainModuleClaims = (userAccessId: number): SubMainModuleModel[] => {
    let campaignSettingClaimRead = $('#campaignSettingClaimRead');
    let campaignSettingClaimWrite = $('#campaignSettingClaimWrite');
    const campaignSettingClaim: SubMainModuleModel = {
        id: 17,
        description: SECURABLE_NAMES.CampaignSetting,
        read: (campaignSettingClaimRead[0] as HTMLInputElement).checked,
        write: (campaignSettingClaimWrite[0] as HTMLInputElement).checked,
        subModuleDetails: campaignSettingDetailClaim(userAccessId),
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let manageCampaignClaimRead = $('#manageCampaignClaimRead');
    let manageCampaignClaimWrite = $('#manageCampaignClaimWrite');
    const manageCampaignClaim: SubMainModuleModel = {
        id: 18,
        description: SECURABLE_NAMES.ManageCampaign,
        read: (manageCampaignClaimRead[0] as HTMLInputElement).checked,
        write: (manageCampaignClaimWrite[0] as HTMLInputElement).checked,
        subModuleDetails: manageCampaignDetailClaim(userAccessId),
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let manageJourneyClaimRead = $('#manageJourneyClaimRead');
    let manageJourneyClaimWrite = $('#manageJourneyClaimWrite');
    const manageJourneyClaim: SubMainModuleModel = {
        id: 35,
        description: SECURABLE_NAMES.ManageJourney,
        read: (manageJourneyClaimRead[0] as HTMLInputElement).checked,
        write: (manageJourneyClaimWrite[0] as HTMLInputElement).checked,
        subModuleDetails: manageJourneyDetailClaim(userAccessId),
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let broadcastClaimRead = $('#broadcastClaimRead');
    let broadcastClaimWrite = $('#broadcastClaimWrite');
    const broadcastClaim: SubMainModuleModel = {
        id: 63,
        description: SECURABLE_NAMES.Broadcast,
        read: (broadcastClaimRead[0] as HTMLInputElement).checked,
        write: (broadcastClaimWrite[0] as HTMLInputElement).checked,        
        subModuleDetails: [],
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let campaignSubMainModuleItems: Array<SubMainModuleModel> = [campaignSettingClaim, manageCampaignClaim, manageJourneyClaim, broadcastClaim];

    return campaignSubMainModuleItems
}