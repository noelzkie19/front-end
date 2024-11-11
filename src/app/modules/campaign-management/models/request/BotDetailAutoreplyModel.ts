import { RequestModel } from "../../../system/models"

export interface BotDetailAutoreplyModel extends RequestModel {
    botDetailId: number;
    botDetailsAutoReplyId: number;
    telegramBotAutoReplyTriggerId: number;
    trigger: string;
    type:string;
    chatValue:string;   
    message: string;
    attachment: string;
}