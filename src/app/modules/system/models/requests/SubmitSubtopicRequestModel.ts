import { SubtopicPostModel } from "..";

export interface SubmitSubtopicRequestModel {
    queueId: string
    userId: string,
    codeListId: number,
    codeListStatus: string,
    subtopics: SubtopicPostModel
}