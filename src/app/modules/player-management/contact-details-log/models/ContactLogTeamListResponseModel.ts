import { ContactLogTeamModel } from "./ContactLogTeamModel";

export interface ContactLogTeamResponseModel {
    contactLogTeamList: Array<ContactLogTeamModel>;
    recordCount: number;
}