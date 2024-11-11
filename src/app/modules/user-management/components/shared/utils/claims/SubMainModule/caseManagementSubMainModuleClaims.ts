import { SECURABLE_NAMES } from "../../../../constants/SecurableNames";
import $ from 'jquery'
import { SubMainModuleModel } from "../../../../../models/SubMainModuleModel";
import { caseManagementLeaderAccessDetailClaim } from "../SubModule/caseManagementLeaderAccessDetailClaim";

export const caseManagementSubMainModuleClaims = (userAccessId: number): SubMainModuleModel[] => {
    let createCustomerCaseClaimRead = $('#createCustomerCaseClaimRead');
    let createCustomerCaseClaimWrite = $('#createCustomerCaseClaimWrite');
    const createCustomerCaseClaim: SubMainModuleModel = {
        id: 38,
        description: SECURABLE_NAMES.CreateCustomerCase,
        read: (createCustomerCaseClaimRead[0] as HTMLInputElement).checked,
        write: (createCustomerCaseClaimWrite[0] as HTMLInputElement).checked,
        subModuleDetails: [],
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let editCustomerCaseClaimRead = $('#editCustomerCaseClaimRead');
    let editCustomerCaseClaimWrite = $('#editCustomerCaseClaimWrite');
    const editCustomerCaseClaim: SubMainModuleModel = {
        id: 39,
        description: SECURABLE_NAMES.EditCustomerCase,
        read: (editCustomerCaseClaimRead[0] as HTMLInputElement).checked,
        write: (editCustomerCaseClaimWrite[0] as HTMLInputElement).checked,
        subModuleDetails: [],
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let addCaseCommunicationClaimRead = $('#addCaseCommunicationClaimRead');
    let addCaseCommunicationClaimWrite = $('#addCaseCommunicationClaimWrite');
    const addCaseCommunicationClaim: SubMainModuleModel = {
        id: 41,
        description: SECURABLE_NAMES.AddCaseCommunication,
        read: (addCaseCommunicationClaimRead[0] as HTMLInputElement).checked,
        write: (addCaseCommunicationClaimWrite[0] as HTMLInputElement).checked,
        subModuleDetails: [],
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let searchCustomerCaseClaimRead = $('#searchCustomerCaseClaimRead');
    let searchCustomerCaseClaimWrite = $('#searchCustomerCaseClaimWrite');
    const searchCustomerCaseClaim: SubMainModuleModel = {
        id: 40,
        description: SECURABLE_NAMES.SearchCaseCommunication,
        read: (searchCustomerCaseClaimRead[0] as HTMLInputElement).checked,
        write: (searchCustomerCaseClaimWrite[0] as HTMLInputElement).checked,
        subModuleDetails: [],
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let viewCustomerCaseClaimRead = $('#viewCustomerCaseClaimRead');
    let viewCustomerCaseClaimWrite = $('#viewCustomerCaseClaimWrite');
    const viewCustomerCaseClaim: SubMainModuleModel = {
        id: 43,
        description: SECURABLE_NAMES.ViewCustomerCase,
        read: (viewCustomerCaseClaimRead[0] as HTMLInputElement).checked,
        write: (viewCustomerCaseClaimWrite[0] as HTMLInputElement).checked,
        subModuleDetails: [],
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let caseManagementLeaderAccessClaimRead = $('#caseManagementLeaderAccessClaimRead');
    let caseManagementLeaderAccessClaimWrite = $('#caseManagementLeaderAccessClaimWrite');
    const caseManagementLeaderAccessClaim: SubMainModuleModel = {
        id: 42,
        description: SECURABLE_NAMES.CaseManagementLeaderAccess,
        read: (caseManagementLeaderAccessClaimRead[0] as HTMLInputElement).checked,
        write: (caseManagementLeaderAccessClaimWrite[0] as HTMLInputElement).checked,
        subModuleDetails: caseManagementLeaderAccessDetailClaim(userAccessId),
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let pcsQuestionnairesClaimRead = $('#pcsQuestionnairesClaimRead');
    let pcsQuestionnairesClaimWrite = $('#pcsQuestionnairesClaimWrite');
    const pcsQuestionnairesClaim: SubMainModuleModel = {
        id: 44,
        description: SECURABLE_NAMES.PCSQuestionnaires,
        read: (pcsQuestionnairesClaimRead[0] as HTMLInputElement).checked,
        write: (pcsQuestionnairesClaimWrite[0] as HTMLInputElement).checked,
        subModuleDetails: [],
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };
    
    let caseManagementSubMainModuleItems: Array<SubMainModuleModel> = 
    [createCustomerCaseClaim, editCustomerCaseClaim, addCaseCommunicationClaim,
        searchCustomerCaseClaim, viewCustomerCaseClaim, caseManagementLeaderAccessClaim,
        pcsQuestionnairesClaim];

    return caseManagementSubMainModuleItems
}
