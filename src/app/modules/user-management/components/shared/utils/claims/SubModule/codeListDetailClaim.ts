import { SubModuleDetailModel } from "../../../../../models/SubModuleDetailModel";
import $ from 'jquery'
import { SECURABLE_NAMES } from "../../../../constants/SecurableNames";

export const codeListDetailClaim = (userAccessId: number): SubModuleDetailModel[] => {
    let topicClaimRead = $('#topicClaimRead');
    let topicClaimWrite = $('#topicClaimWrite');
    const topicClaim: SubModuleDetailModel = {
        id: 1,
        description: SECURABLE_NAMES.Topic,
        read: (topicClaimRead[0] as HTMLInputElement).checked,
        write: (topicClaimWrite[0] as HTMLInputElement).checked,
        updatedBy: userAccessId,
        createdBy: userAccessId,
    };

    let subtopicClaimRead = $('#subtopicClaimRead');
    let subtopicClaimWrite = $('#subtopicClaimWrite');
    const subtopicClaim: SubModuleDetailModel = {
        id: 2,
        description: SECURABLE_NAMES.Subtopic,
        read: (subtopicClaimRead[0] as HTMLInputElement).checked,
        write: (subtopicClaimWrite[0] as HTMLInputElement).checked,
        updatedBy: userAccessId,
        createdBy: userAccessId,
    };

    let messageTypeClaimRead = $('#messageTypeClaimRead');
    let messageTypeClaimWrite = $('#messageTypeClaimWrite');
    const messageTypeClaim: SubModuleDetailModel = {
        id: 3,
        description: SECURABLE_NAMES.MessageType,
        write: (messageTypeClaimWrite[0] as HTMLInputElement).checked,
        read: (messageTypeClaimRead[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let messageStatusClaimRead = $('#messageStatusClaimRead');
    let messageStatusClaimWrite = $('#messageStatusClaimWrite');
    const messageStatusClaim: SubModuleDetailModel = {
        id: 4,
        description: SECURABLE_NAMES.MessageStatus,
        write: (messageStatusClaimWrite[0] as HTMLInputElement).checked,
        read: (messageStatusClaimRead[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let messageResponseClaimRead = $('#messageResponseClaimRead');
    let messageResponseClaimWrite = $('#messageResponseClaimWrite');
    const messageResponseClaim: SubModuleDetailModel = {
        id: 5,
        description: SECURABLE_NAMES.MessageResponse,
        write: (messageResponseClaimWrite[0] as HTMLInputElement).checked,
        read: (messageResponseClaimRead[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };


    let feedbackTypeClaimRead = $('#feedbackTypeClaimRead');
    let feedbackTypeClaimWrite = $('#feedbackTypeClaimWrite');
    const feedbackTypeClaim: SubModuleDetailModel = {
        id: 6,
        description: SECURABLE_NAMES.FeedbackType,
        write: (feedbackTypeClaimWrite[0] as HTMLInputElement).checked,
        read: (feedbackTypeClaimRead[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let feedbackCategoryClaimRead = $('#feedbackCategoryClaimRead');
    let feedbackCategoryClaimWrite = $('#feedbackCategoryClaimWrite');
    const feedbackCategoryClaim: SubModuleDetailModel = {
        id: 7,
        description: SECURABLE_NAMES.FeedbackCategory,
        write: (feedbackCategoryClaimWrite[0] as HTMLInputElement).checked,
        read: (feedbackCategoryClaimRead[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let feedbackAnswerClaimRead = $('#feedbackAnswerClaimRead');
    let feedbackAnswerClaimWrite = $('#feedbackAnswerClaimWrite');
    const feedbackAnswerClaim: SubModuleDetailModel = {
        id: 8,
        description: SECURABLE_NAMES.FeedbackAnswer,
        write: (feedbackAnswerClaimWrite[0] as HTMLInputElement).checked,
        read: (feedbackAnswerClaimRead[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let codeListDetailItems: Array<SubModuleDetailModel> =
        [topicClaim, subtopicClaim, messageTypeClaim,
            messageStatusClaim, messageResponseClaim, feedbackTypeClaim,
            feedbackCategoryClaim, feedbackAnswerClaim];

    return codeListDetailItems
}