import { RequestModel } from "../../../../system/models";

export interface ImportInFilePlayersRequestModel extends RequestModel {
	validPlayerIdList: string
}