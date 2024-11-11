export interface ColumnDisplayModel {
    label: string
    value: string
    isPinned: boolean
    isChecked:boolean
    order?: number
    displayFieldDependency?: string | null
    isParentDependency?: boolean
}