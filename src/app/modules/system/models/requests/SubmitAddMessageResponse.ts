import { AddMessageResponseModel } from "./AddMessageResponseModel";

export interface SubmitAddMessageResponse {
    queueId: string
    userId: string,
    codeListId: number,
    isActive: boolean,
    messageResponses: Array<AddMessageResponseModel>
}