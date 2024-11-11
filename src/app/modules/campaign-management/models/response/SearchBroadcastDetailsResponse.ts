import {SearchBroadcastModel} from "./SearchBroadcastModel";

export interface SearchBroadcastDetailsResponse {
	broadcastList: Array<SearchBroadcastModel>;
    rowCount: number;
}
