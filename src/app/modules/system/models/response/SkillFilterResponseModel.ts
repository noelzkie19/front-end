import { SkillResponseModel } from "./SkillResponseModel"

export interface SkillFilterResponseModel {
    skillList: Array<SkillResponseModel>
    recordCount: number
}