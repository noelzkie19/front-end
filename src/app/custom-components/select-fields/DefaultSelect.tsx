import React, { ReactNode } from 'react'
import Select from 'react-select'

interface Props {
    children?: ReactNode
    data?: any
    defaultValue? : any
    onChange: (val: string) => void
    value: string
    isSearchable?:boolean
    isDisabled?:boolean
}

const DefaultSelect: React.FC<Props> = ( props ) => {

    return (
        <div className="col-sm-10">
            <Select
                native
                size="small"
                style={{ width: '100%' }}
                options={props.data}
                defaultValue={props.defaultValue}
                onChange={props.onChange}
                value={props.value}
                isSearchable={props.isSearchable}
                isDisabled={props.isDisabled}
            />
        </div>
    )
}

export default DefaultSelect
