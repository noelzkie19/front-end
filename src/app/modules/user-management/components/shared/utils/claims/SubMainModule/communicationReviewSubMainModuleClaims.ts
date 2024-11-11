import { SECURABLE_NAMES } from "../../../../constants/SecurableNames";
import { SubModuleEnum } from "../../../../../../../constants/Constants";
import { SubMainModuleModel } from "../../../../../models/SubMainModuleModel";

export const communicationReviewSubMainModuleClaims = (userAccessId: number): SubMainModuleModel[] => {
    const communicationReviewerClaimRead = document.getElementById('communicationReviewerReadChkbox') as HTMLInputElement;
    const communicationReviewerClaimWrite = document.getElementById('communicationReviewerWriteChkbox') as HTMLInputElement;
    const communicateionReviewerClaim: SubMainModuleModel = {
        id: SubModuleEnum.CommunicationReviewer,
        description: SECURABLE_NAMES.CommunicationReviewer,
        read: communicationReviewerClaimRead.checked,
        write: communicationReviewerClaimWrite.checked,
        subModuleDetails: [],
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    const communicationRevieweeClaimRead = document.getElementById('communicationRevieweeReadChkbox') as HTMLInputElement;
    const communicationRevieweeClaimWrite = document.getElementById('communicationRevieweeWriteChkbox') as HTMLInputElement;
    const communicateionRevieweeClaim: SubMainModuleModel = {
        id: SubModuleEnum.CommunicationReviewee,
        description: SECURABLE_NAMES.CommunicationReviewee,
        read: communicationRevieweeClaimRead.checked,
        write: communicationRevieweeClaimWrite.checked,
        subModuleDetails: [],
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    const communicationAnnotateClaimRead = document.getElementById('communicationAnnotateReadChkbox') as HTMLInputElement;
    const communicationAnnotateClaimWrite = document.getElementById('communicationAnnotateWriteChkbox') as HTMLInputElement;
    const communicateionAnnotateClaim: SubMainModuleModel = {
        id: SubModuleEnum.CommunicationAnnotation,
        description: SECURABLE_NAMES.CommunicationAnnotation,
        read: communicationAnnotateClaimRead.checked,
        write: communicationAnnotateClaimWrite.checked,
        subModuleDetails: [],
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };
    const communicationReviewReportClaimRead = document.getElementById('communicationReviewReportReadChkbox') as HTMLInputElement;
    const communicationReviewReportClaimWrite = document.getElementById('communicationReviewReportWriteChkbox') as HTMLInputElement;
    const communicateionReviewReportClaim: SubMainModuleModel = {
        id: SubModuleEnum.CommunicationReviewReport,
        description: SECURABLE_NAMES.CommunicationReviewReport,
        read: communicationReviewReportClaimRead.checked,
        write: communicationReviewReportClaimWrite.checked,
        subModuleDetails: [],
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    const managePrimaryFlagReadChkbox = document.getElementById('managePrimaryFlagReadChkbox') as HTMLInputElement;
    const managePrimaryFlagWriteChkbox = document.getElementById('managePrimaryFlagWriteChkbox') as HTMLInputElement;
    const managePrimaryFlagClaim: SubMainModuleModel = {
        id: SubModuleEnum.ManagePrimaryFlag,
        description: SECURABLE_NAMES.ManagePrimaryFlag,
        read: managePrimaryFlagReadChkbox.checked,
        write: managePrimaryFlagWriteChkbox.checked,
        subModuleDetails: [],
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let communicationReviewSubMainModuleItems: Array<SubMainModuleModel> =
        [communicateionReviewerClaim, communicateionRevieweeClaim, communicateionAnnotateClaim, communicateionReviewReportClaim, managePrimaryFlagClaim];

    return communicationReviewSubMainModuleItems
}