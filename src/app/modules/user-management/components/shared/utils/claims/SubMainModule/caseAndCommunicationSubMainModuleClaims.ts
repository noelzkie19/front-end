import { SECURABLE_NAMES } from "../../../../constants/SecurableNames";
import $ from 'jquery'
import { SubMainModuleModel } from "../../../../../models/SubMainModuleModel";

export const caseAndCommunicationSubMainModuleClaims = (userAccessId: number) => {
    let createCaseClaimRead = $('#createCaseClaimRead');
    let createCaseClaimWrite = $('#createCaseClaimWrite');
    const createCaseClaim: SubMainModuleModel = {
        id: 19,
        description: SECURABLE_NAMES.CreateCase,
        read: (createCaseClaimRead[0] as HTMLInputElement).checked,
        write: (createCaseClaimWrite[0] as HTMLInputElement).checked,
        subModuleDetails: [],
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let viewCaseClaimRead = $('#viewCaseClaimRead');
    let viewCaseClaimWrite = $('#viewCaseClaimWrite');
    const viewCaseClaim: SubMainModuleModel = {
        id: 20,
        description: SECURABLE_NAMES.ViewCase,
        read: (viewCaseClaimRead[0] as HTMLInputElement).checked,
        write: (viewCaseClaimWrite[0] as HTMLInputElement).checked,
        subModuleDetails: [],
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let addCommunicationClaimRead = $('#addCommunicationClaimRead');
    let addCommunicationClaimWrite = $('#addCommunicationClaimWrite');
    const addCommunicationCClaim: SubMainModuleModel = {
        id: 21,
        description: SECURABLE_NAMES.AddCommunication,
        read: (addCommunicationClaimRead[0] as HTMLInputElement).checked,
        write: (addCommunicationClaimWrite[0] as HTMLInputElement).checked,
        subModuleDetails: [],
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let viewCommunicationClaimRead = $('#viewCommunicationClaimRead');
    let viewCommunicationClaimWrite = $('#viewCommunicationClaimWrite');
    const viewCommunicationCClaim: SubMainModuleModel = {
        id: 22,
        description: SECURABLE_NAMES.ViewCommunication,
        read: (viewCommunicationClaimRead[0] as HTMLInputElement).checked,
        write: (viewCommunicationClaimWrite[0] as HTMLInputElement).checked,
        subModuleDetails: [],
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };


    let editCommunicationClaimRead = $('#editCommunicationClaimRead');
    let editCommunicationClaimWrite = $('#editCommunicationClaimWrite');
    const editCommunicationCClaim: SubMainModuleModel = {
        id: 23,
        description: SECURABLE_NAMES.EditCommunication,
        read: (editCommunicationClaimRead[0] as HTMLInputElement).checked,
        write: (editCommunicationClaimWrite[0] as HTMLInputElement).checked,
        subModuleDetails: [],
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let caseAndCommunicationSubMainModuleItems: Array<SubMainModuleModel> =
        [createCaseClaim, viewCaseClaim, addCommunicationCClaim,
            viewCommunicationCClaim, editCommunicationCClaim];

    return caseAndCommunicationSubMainModuleItems
}