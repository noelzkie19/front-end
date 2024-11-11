import { TicketCommentModel } from "./TicketCommentModel";

export interface TicketCommentResponseModel {
    totalCommentListCount: number;
    commentList: Array<TicketCommentModel>
}