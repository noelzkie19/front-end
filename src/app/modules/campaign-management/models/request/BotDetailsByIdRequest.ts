import {RequestModel} from "../../../system/models";

export interface BotDetailsByIdRequest extends RequestModel{
    botDetailId: number;
    botUsername: string;
	botId?: number;
	botToken: string;
	brandId: number;
    botMlabUserId: number;
    statusId: number;
}