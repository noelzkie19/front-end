import { SubModuleDetailModel } from "../../../../../models/SubModuleDetailModel";
import $ from 'jquery'
import { SECURABLE_NAMES } from "../../../../constants/SecurableNames";
import { SECURABLE_IDS } from "../../../../constants/SecurableIdentifier";


export const staffPerformanceDetailClaim = (userAccessId: number): SubModuleDetailModel[] => {

  let communicationReviewPeriodClaimRead = $('#communicationReviewPeriodClaimRead');
  let communicationReviewPeriodClaimWrite = $('#communicationReviewPeriodClaimWrite');
  const communicationReviewPeriodClaim: SubModuleDetailModel = {
      id: SECURABLE_IDS.CommunicationReviewPeriod,
      description: SECURABLE_NAMES.CommunicationReviewPeriod,
      write: (communicationReviewPeriodClaimWrite[0] as HTMLInputElement).checked,
      read: (communicationReviewPeriodClaimRead[0] as HTMLInputElement).checked,
      createdBy: userAccessId,
      updatedBy: userAccessId,
  };

  let manageTicketsDetailItems: Array<SubModuleDetailModel> =  [communicationReviewPeriodClaim];

    return manageTicketsDetailItems
 }