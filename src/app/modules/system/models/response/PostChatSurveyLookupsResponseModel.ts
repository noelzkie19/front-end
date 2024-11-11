import { LookupModel } from "../../../../shared-models/LookupModel";
import { LicenseResponseModel } from "./LicenseResponseModel";
import { SkillsResponseModel } from "./SkillsResponseModel";


export interface PostChatSurveyLookupsResponseModel {
    licenses: Array<LookupModel>,
    skills: Array<LookupModel>,
    licenseByBrandMessageType: Array<LicenseResponseModel>,
    skillsByLicense: Array<SkillsResponseModel>
}