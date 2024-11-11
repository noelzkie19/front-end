import React from 'react'
import SelectSearch, { fuzzySearch } from 'react-select-search';
import './SelectSearchBox.css'

interface Options {
    value: string,
    label: string
}

interface Props {
    options: any;
    onChange:(e: any) => void;
    value: string
    placeholder: string
}

const SelectSearchBox: React.FC<Props> = ({options,onChange,value,placeholder }) => {
    return (
            <SelectSearch
                value={value}
                options={options}
                search
                placeholder={placeholder}
                filterOptions={fuzzySearch}
                onChange={onChange}
            />
    )
}

export default SelectSearchBox
