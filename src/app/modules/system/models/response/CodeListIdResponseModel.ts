export interface CodeListIdResponseModel {
    id: number,
    position: number,
    codeListName: string,
    codeListTypeName: string,
    parentCodeListName: string,
    codeListTypeId: number,
    parentId: number,
    isActive: boolean,
    fieldTypeId: number,
    fieldTypeName: string,
    updatedByName: string,
    updateById: number,
    createdBy?: number,
    createdByName?: string
}