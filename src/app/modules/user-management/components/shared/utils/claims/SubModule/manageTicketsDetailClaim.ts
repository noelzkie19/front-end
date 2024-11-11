import { SubModuleDetailModel } from "../../../../../models/SubModuleDetailModel";
import $ from 'jquery'
import { SECURABLE_NAMES } from "../../../../constants/SecurableNames";
import { SECURABLE_IDS } from "../../../../constants/SecurableIdentifier";


export const missingDepositDetailClaim = (userAccessId: number): SubModuleDetailModel[] => {

  let reporterRoleClaimRead = $('#reporterRoleClaimRead');
  let reporterRoleClaimWrite = $('#reporterRoleClaimWrite');
  const reporterRoleClaim: SubModuleDetailModel = {
      id: SECURABLE_IDS.ReporterRole,
      description: SECURABLE_NAMES.ReporterRole,
      write: (reporterRoleClaimWrite[0] as HTMLInputElement).checked,
      read: (reporterRoleClaimRead[0] as HTMLInputElement).checked,
      createdBy: userAccessId,
      updatedBy: userAccessId,
  };

  let manageTicketsDetailItems: Array<SubModuleDetailModel> =  [reporterRoleClaim];

    return manageTicketsDetailItems
 }