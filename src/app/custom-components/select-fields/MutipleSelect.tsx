import React from 'react'
import Select from 'react-select'

interface Options {
    value: string,
    label: string
}

interface Props {
    options: any;
    onChange:(val: string) => void;
    value: string
}

const MutipleSelect: React.FC<Props> = ({options,onChange,value }) => {
    return (
        <div className="col-sm-10">
            <Select
                isMulti
                options={options}
                onChange={onChange}
                value={value}
            />
        </div>
    )
}

export default MutipleSelect
