import { SubModuleDetailModel } from "../../../../../models/SubModuleDetailModel";
import $ from 'jquery'
import { SECURABLE_NAMES } from "../../../../constants/SecurableNames";
import { SECURABLE_IDS } from "../../../../constants/SecurableIdentifier";


export const missingWithdrawalDetailClaim = (userAccessId: number): SubModuleDetailModel[] => {

  let reporterClaimRead = $('#missingWithdrawalReporterClaimRead');
  let reporterClaimWrite = $('#missingWithdrawalReporterClaimWrite');
  const reporterClaim: SubModuleDetailModel = {
      id: SECURABLE_IDS.MissingWithdrawalReporter,
      description: SECURABLE_NAMES.Reporter,
      write: (reporterClaimWrite[0] as HTMLInputElement).checked,
      read: (reporterClaimRead[0] as HTMLInputElement).checked,
      createdBy: userAccessId,
      updatedBy: userAccessId,
  };

  let manageTicketsDetailItems: Array<SubModuleDetailModel> =  [reporterClaim];

    return manageTicketsDetailItems
 }