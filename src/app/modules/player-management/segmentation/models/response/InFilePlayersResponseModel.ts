import { InFileInvalidPlayerReportResponseModel } from "./InFileInvalidPlayerReportResponseModel";

export interface InFilePlayersResponseModel {
	validBrandId: string;
	validPlayerCount: number;
	invalidPlayerCount: number;
	duplicatePlayerCount: number;
	validPlayerIdList: string;
	remarksForInvalidPlayers: Array<InFileInvalidPlayerReportResponseModel>
}