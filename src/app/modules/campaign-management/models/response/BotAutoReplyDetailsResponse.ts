import { BotAutoReplyModel } from "./BotAutoReplyModel";

export interface BotAutoReplyDetailsResponse {
	botDetailsAutoReplyList: Array<BotAutoReplyModel>;
    recordCount: number;
}
