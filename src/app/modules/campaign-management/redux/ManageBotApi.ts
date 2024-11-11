import axios from 'axios';
import {AppConfiguration} from 'read-appsettings-json';
import {BotAutoReplyDetailsRequest} from '../models/request/BotAutoReplyDetailsRequest';
import {BotDetailAutoreplyModel} from '../models/request/BotDetailAutoreplyModel';
import {BotDetailsByIdRequest} from '../models/request/BotDetailsByIdRequest';
import {BotDetailsFilterRequest} from '../models/request/BotDetailsFilterRequest';
import {BotAutoReplyDetailsResponse} from '../models/response/BotAutoReplyDetailsResponse';
import {BotDetailsFilterResponse} from '../models/response/BotDetailsFilterResponse';

// Global Configuration for axios
const API_GATEWAY_URL: string = AppConfiguration.Setting().REACT_APP_MLAB_GATEWAY_URL || '';
const API_CALLBACK_URL = AppConfiguration.Setting().REACT_APP_MLAB_CALLBACK_URL;

const GET_REM_DISTRIBUTION_LIST: string = `${API_GATEWAY_URL}EngagementHub/GetBotAutoReplyListResultByFilter`;
export async function GetBotAutoReplyList(request: BotAutoReplyDetailsRequest) {
	return await axios.post(GET_REM_DISTRIBUTION_LIST, request);
}

const GET_REM_DISTRIBUTION_LIST_RESULT: string = `${API_CALLBACK_URL}EngagementHub/GetBotAutoReplyListResultByFilter`;
export async function GetBotAutoReplyListResult(request: string) {
	return axios.get<BotAutoReplyDetailsResponse>(GET_REM_DISTRIBUTION_LIST_RESULT, {
		params: {
			cachedId: request,
		},
	});
}


const UPSERT_BOT_DETAILS: string = `${API_GATEWAY_URL}EngagementHub/UpSertBotDetails`;
export async function UpSertBotDetails(request: BotDetailsByIdRequest) {
	return axios.post(UPSERT_BOT_DETAILS, request)
}

const UPSERT_BOT_DETAILS_RESULT: string = `${API_CALLBACK_URL}EngagementHub/UpSertBotDetails`;
export async function UpSertBotDetailsResult(cacheId: string) {
	return axios.get(UPSERT_BOT_DETAILS_RESULT, {
		params: {
		  cachedId: cacheId,
		},
	  })
}


const VALIDATE_BOT_ID: string = `${API_GATEWAY_URL}EngagementHub/ValidateBotId`;
export async function ValidateBotId(botId: number) {
	return await axios.get<boolean>(VALIDATE_BOT_ID, {
		params: {
			botId: botId,
		}
	})
}

const GET_BOT_DETAIL_LIST: string = `${API_GATEWAY_URL}EngagementHub/GetBotDetailListResultByFilter`;
export async function GetBotDetailList(request: BotDetailsFilterRequest) {
	return await axios.post(GET_BOT_DETAIL_LIST, request);
}

const GET_BOT_DETAIL_LIST_RESULT: string = `${API_CALLBACK_URL}Cache/GetById`;
export async function GetBotDetailListResult(request: string) {
	return axios.get<Array<BotDetailsFilterResponse>>(GET_BOT_DETAIL_LIST_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

const GET_BOT_AUTO_REPLY_LIST: string = `${API_GATEWAY_URL}EngagementHub/GetBotAutoReplyListByFilter`;
export async function GetBotDetailAutoReplyList(request: BotAutoReplyDetailsRequest) {
	return await axios.post(GET_BOT_AUTO_REPLY_LIST, request);
}

const GET_BOT_AUTO_REPLY_LIST_RESULT: string = `${API_CALLBACK_URL}Cache/GetById`;
export async function GetBotDetailAutoReplyListResult(request: string) {
	return axios.get<BotAutoReplyDetailsResponse>(GET_BOT_AUTO_REPLY_LIST_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

const UPSERT_BOT_DETAILS_AUTO_REPLY: string = `${API_GATEWAY_URL}EngagementHub/UpSertBotDetailsAutoReply`;
export async function UpSertBotDetailAutoReply(request: BotDetailAutoreplyModel) {
	return axios.post(UPSERT_BOT_DETAILS_AUTO_REPLY, request)
}


export async function ValidateTelegramBot(botToken : string) {
    // Fetch data from the backend endpoint to get updates
	return await axios.get(`https://api.telegram.org/bot${botToken}/getMe`) //TelegramBot API endpoint
  };

  const DELETE_BOT_AUTO_REPLY: string = `${API_GATEWAY_URL}EngagementHub/DeleteAutoReply`;
  export async function DeleteBotAutoReply(telegramBotAutoReplyTriggerId: number) {
	  return await axios.get(DELETE_BOT_AUTO_REPLY, {
		params: {
			telegramBotAutoReplyTriggerId: telegramBotAutoReplyTriggerId,
		},});
  }
  const BOT_TELEGRAM_CUSTOM_REPLY_COUNT: string = `${API_GATEWAY_URL}EngagementHub/TelegramCustomAutoReplyCount`;
  export async function TelegramCustomAutoReplyCount(botDetailId: number) {
	  return await axios.get(BOT_TELEGRAM_CUSTOM_REPLY_COUNT, {
		params: {
			botDetailId: botDetailId,
		},});
  }
  