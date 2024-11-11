import { SubModuleDetailModel } from "../../../../../models/SubModuleDetailModel";
import $ from 'jquery'
import { SECURABLE_NAMES } from "../../../../constants/SecurableNames";

export const segmentationDetailClaims = (userAccessId: number): SubModuleDetailModel[] => {
    let createSegmentationClaimRead = $('#createSegmentationClaimRead');
    let createSegmentationClaimWrite = $('#createSegmentationClaimWrite');
    const createSegmentationClaim: SubModuleDetailModel = {
        id: 9,
        description: SECURABLE_NAMES.CreateSegmentation,
        write: (createSegmentationClaimWrite[0] as HTMLInputElement).checked,
        read: (createSegmentationClaimRead[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let manageSegmentationClaimRead = $('#manageSegmentationClaimRead');
    let manageSegmentationClaimWrite = $('#manageSegmentationClaimWrite');
    const manageSegmentationClaim: SubModuleDetailModel = {
        id: 10,
        description: SECURABLE_NAMES.ManageSegmentation,
        write: (manageSegmentationClaimWrite[0] as HTMLInputElement).checked,
        read: (manageSegmentationClaimRead[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let segmentationToStaticClaimRead = $('#segmentationToStaticClaimRead');
    let segmentationToStaticClaimWrite = $('#segmentationToStaticClaimWrite');
    const segmentationToStaticClaim: SubModuleDetailModel = {
        id: 11,
        description: SECURABLE_NAMES.SetSegmentationToStatic,
        write: (segmentationToStaticClaimWrite[0] as HTMLInputElement).checked,
        read: (segmentationToStaticClaimRead[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let segmentationCustomQueryClaimRead = $('#segmentationCustomQueryClaimRead');
    let segmentationCustomQueryClaimWrite = $('#segmentationCustomQueryClaimWrite');
    const segmentationCustomQueryClaim: SubModuleDetailModel = {
        id: 58,
        description: SECURABLE_NAMES.CreateCustomQuery,
        write: (segmentationCustomQueryClaimWrite[0] as HTMLInputElement).checked,
        read: (segmentationCustomQueryClaimRead[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let segmentationDetailItems: Array<SubModuleDetailModel> =
        [createSegmentationClaim, manageSegmentationClaim, segmentationToStaticClaim, segmentationCustomQueryClaim];

    return segmentationDetailItems
}