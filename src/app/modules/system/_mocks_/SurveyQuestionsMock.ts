import { SurveyQuestionAnswerModel } from './../models/SurveyQuestionAnswerModel';
import { SurveyQuestionModel } from "../models/SurveyQuestionModel";

export class SurveyQuestionsMock {
    public static table : Array<SurveyQuestionModel> = [
        {
            surveyQuestionId: 1,
            surveyQuestionName: 'Prefer Bank Name',
            fieldTypeId: 6,
            fieldTypeName: 'Text Input',
            isActive: false,
            createdBy: 1,
            surveyQuestionAnswers: Array<SurveyQuestionAnswerModel>(),
            createdDate: new Date().toDateString(),
            createdByName: 'John Doe',
            updatedByName: 'Jhon Agapito',
            updatedBy: 1,
            updatedDate: new Date().toDateString()
        },
        {
            surveyQuestionId: 2,
            surveyQuestionName: 'Prefer Promotion',
            fieldTypeId: 6,
            fieldTypeName: 'Text Input',
            isActive: true,
            surveyQuestionAnswers: Array<SurveyQuestionAnswerModel>(),
            createdBy: 2,
            createdDate: new Date().toDateString(),
            updatedBy: 1,
            createdByName: 'John Doe',
            updatedByName: 'Jhon Agapito',
            updatedDate: new Date().toDateString()
        },
        {
            surveyQuestionId: 3,
            surveyQuestionName: 'Suggestion for Promotion',
            fieldTypeId: 7,
            fieldTypeName: 'Multiline Text Input',
            isActive: true,
            createdBy: 3,
            surveyQuestionAnswers: Array<SurveyQuestionAnswerModel>(),
            createdDate: new Date().toDateString(),
            updatedBy: 1,
            createdByName: 'John Doe',
            updatedByName: 'Jhon Agapito',
            updatedDate: new Date().toDateString()
        },
        {
            surveyQuestionId: 4,
            surveyQuestionName: 'Reason for Not Deposit',
            fieldTypeId: 3,
            fieldTypeName: 'Dropdown Multi Select',
            isActive: true,
            createdBy: 4,
            createdByName: 'John Doe',
            updatedByName: 'Jhon Agapito',
            surveyQuestionAnswers: Array<SurveyQuestionAnswerModel>(),
            createdDate: new Date().toDateString(),
            updatedBy: 1,
            updatedDate: new Date().toDateString()
        },
        {
            surveyQuestionId: 5,
            surveyQuestionName: 'Prefer Product',
            fieldTypeId: 3,
            fieldTypeName: 'Dropdown Multi Select',
            isActive: true,
            createdBy: 5,
            createdByName: 'John Doe',
            updatedByName: 'Jhon Agapito',
            surveyQuestionAnswers: Array<SurveyQuestionAnswerModel>(),
            createdDate: new Date().toDateString(),
            updatedBy: 1,
            updatedDate: new Date().toDateString()
        },
    ];
}