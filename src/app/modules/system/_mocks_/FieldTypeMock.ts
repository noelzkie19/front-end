import { FieldTypeModel } from "../models/FieldTypeModel";

export class FieldTypeMock {
    public static table : Array<FieldTypeModel> = [
        {id: 1, fieldTypeName: 'Dropdown'},
        {id: 2, fieldTypeName: 'Dropdown With Search'},
        {id: 3, fieldTypeName: 'Dropdown Multi Select'},
        {id: 4, fieldTypeName: 'Dropdown Multi Select With Search'},
        {id: 5, fieldTypeName: 'Radio Button'},
        {id: 6, fieldTypeName: 'Text Input'},
        {id: 7, fieldTypeName: 'Multiline Text Input'},
    ]
}