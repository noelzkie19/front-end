import { CodeListTypeModel } from "../models/CodeListTypeModel";

export class CodeListTypeMock {
    public static table: Array<CodeListTypeModel> = [
        {
            id: 1,
            codeListTypeName: 'Main'
        },
        {
            id: 2,
            codeListTypeName: 'Main - Communication'
        },
        {
            id: 3,
            codeListTypeName: 'Feedback'
        },
    ]
}