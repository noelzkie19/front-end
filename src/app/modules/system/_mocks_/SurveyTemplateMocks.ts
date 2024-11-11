import { SurveyTemplateModel } from "../models/SurveyTemplateModel";

export class SurveyTemplateMocks {
    public static table : Array<SurveyTemplateModel> = [
        {
            id: 1,
            name: 'PE Welcome Call',
            status: true,
            description: 'Questionnaire for PE Team\'s welcome call',
            caseType: 'Campaign',
            messageType: 'FlyFone Call',
            createdBy: 1,
            caseTypeId: 1,
            messageTypeId: 1
        },
        {
            id: 2,
            name: 'ACQ Welcome Call',
            status: true,
            description: 'Questionnaire for ACQ Team\'s welcome call',
            caseType: 'Campaign',
            messageType: 'FlyFone Call',
            createdBy: 1,
            caseTypeId: 1,
            messageTypeId: 1
        },
        {
            id: 3,
            name: 'Win-Back Call',
            status: false,
            description: 'Questionnaire for PE Team\'s welcome call',
            caseType: 'Campaign',
            messageType: 'FlyFone Call',
            createdBy: 1,
            caseTypeId: 1,
            messageTypeId: 1
        },
        {
            id: 4,
            name: '2021 Indonesia Independence Day Campaign',
            status: true,
            description: 'Questionnaire for Indonesia Independence Day Special Campaign',
            caseType: 'Campaign',
            messageType: 'FlyFone Call',
            createdBy: 1,
            caseTypeId: 1,
            messageTypeId: 1
        },
        {
            id: 5,
            name: '2022 New Year Campaign',
            status: true,
            description: 'Questionaire new year 2022 special campaign',
            caseType: 'Campaign',
            messageType: 'FlyFone Call',
            createdBy: 1,
            caseTypeId: 1,
            messageTypeId: 1
        },
    ]
}