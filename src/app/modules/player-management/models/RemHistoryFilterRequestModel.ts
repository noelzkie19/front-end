import { PaginationModel } from "../../../shared-models/PaginationModel";
import { RequestModel } from "../../system/models";
import { RemHistoryFilterBaseRequestModel } from "./RemHistoryFilterBaseRequestModel";

export interface RemHistoryFilterRequestModel extends RequestModel, PaginationModel, RemHistoryFilterBaseRequestModel {

}