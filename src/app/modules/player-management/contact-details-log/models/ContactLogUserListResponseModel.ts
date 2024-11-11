import { ContactLogUserModel } from "./ContactLogUserModel";

export interface ContactLogUserResponseModel {
    contactLogUserList: Array<ContactLogUserModel>;
    recordCount: number;
}