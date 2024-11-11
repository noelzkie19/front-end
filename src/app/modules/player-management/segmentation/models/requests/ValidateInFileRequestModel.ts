import { RequestModel } from "../../../../system/models";
import { InFileSegmentModel } from "../InFileSegmentModel";

export interface ValidateInFileRequestModels extends RequestModel {
    playerList: InFileSegmentModel,
}