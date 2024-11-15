import { CodeListModel } from "../models/CodeListModel";

export class CodeListMock {
    public static table: Array<CodeListModel> = [
        {
            id: 1,
            codeListName:'Topic',
            isActive: true,
            fieldTypeId: 1,
            fieldTypeName: 'Dropdown',
            codeListTypeId: 1,
            codeListTypeName: 'Main',
            parentId: null,
            parentCodeListName: '-',
            createdBy: 1,
            createdDate: new Date().toDateString(),
            createdByName: 'John Doe',
            updatedByName: 'Jhon Agapito',
            updatedBy: 1,
            updatedDate: new Date().toDateString(),
            route: '/system/edit-feedback-type'
        },
        {
            id: 2,
            codeListName:'SubTopic',
            isActive: true,
            fieldTypeId: 1,
            fieldTypeName: 'Dropdown',
            codeListTypeId: 1,
            codeListTypeName: 'Main',
            parentId: 1,
            parentCodeListName: 'Topic',
            createdBy: 1,
            createdDate: new Date().toDateString(),
            createdByName: 'John Doe',
            updatedByName: 'Jhon Agapito',
            updatedBy: 1,
            updatedDate: new Date().toDateString(),
            route: '/system/edit-feedback-type'
        },
        {
            id: 3,
            codeListName:'Message Type',
            isActive: true,
            fieldTypeId: 1,
            fieldTypeName: 'Dropdown',
            codeListTypeId: 2,
            codeListTypeName: 'Main - Communication',
            parentId: 1,
            parentCodeListName: 'Topic',
            createdBy: 1,
            createdDate: new Date().toDateString(),
            createdByName: 'John Doe',
            updatedByName: 'Jhon Agapito',
            updatedBy: 1,
            updatedDate: new Date().toDateString(),
            route: '/system/edit-feedback-type'
        },
        {
            id: 4,
            codeListName:'Message Status',
            isActive: true,
            fieldTypeId: 1,
            fieldTypeName: 'Dropdown',
            codeListTypeId: 2,
            codeListTypeName: 'Main - Communication',
            parentId: 3,
            parentCodeListName: 'Message Type',
            createdBy: 1,
            createdDate: new Date().toDateString(),
            createdByName: 'John Doe',
            updatedByName: 'Jhon Agapito',
            updatedBy: 1,
            updatedDate: new Date().toDateString(),
            route: '/system/edit-feedback-type'
        },
        {
            id: 5,
            codeListName:'Message Response',
            isActive: true,
            fieldTypeId: 1,
            fieldTypeName: 'Dropdown',
            codeListTypeId: 2,
            codeListTypeName: 'Main - Communication',
            parentId: 4,
            parentCodeListName: 'Message Status',
            createdBy: 1,
            createdDate: new Date().toDateString(),
            createdByName: 'John Doe',
            updatedByName: 'Jhon Agapito',
            updatedBy: 1,
            updatedDate: new Date().toDateString(),
            route: '/system/edit-feedback-type'
        },
        {
            id: 6,
            codeListName:'Feedback Type',
            isActive: true,
            fieldTypeId: 1,
            fieldTypeName: 'Dropdown',
            codeListTypeId: 3,
            codeListTypeName: 'Feedback',
            parentId: null,
            parentCodeListName: '-',
            createdBy: 1,
            createdDate: new Date().toDateString(),
            createdByName: 'John Doe',
            updatedByName: 'Jhon Agapito',
            updatedBy: 1,
            updatedDate: new Date().toDateString(),
            route: '/system/edit-feedback-type'
        },
        {
            id: 7,
            codeListName:'Feedback Category',
            isActive: true,
            fieldTypeId: 1,
            fieldTypeName: 'Dropdown',
            codeListTypeId: 3,
            codeListTypeName: 'Feedback',
            parentId: 6,
            parentCodeListName: 'Feedback Type',
            createdBy: 1,
            createdDate: new Date().toDateString(),
            createdByName: 'John Doe',
            updatedByName: 'Jhon Agapito',
            updatedBy: 1,
            updatedDate: new Date().toDateString(),
            route: '/system/edit-feedback-type'
        },
        {
            id: 8,
            codeListName:'Feedback Answer',
            isActive: true,
            fieldTypeId: 1,
            fieldTypeName: 'Dropdown',
            codeListTypeId: 3,
            codeListTypeName: 'Feedback',
            parentId: 7,
            parentCodeListName: 'Feedback Category',
            createdBy: 1,
            createdDate: new Date().toDateString(),
            createdByName: 'John Doe',
            updatedByName: 'Jhon Agapito',
            updatedBy: 1,
            updatedDate: new Date().toDateString(),
            route: '/system/edit-feedback-type/' 
        },
    ]
}