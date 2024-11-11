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
    placeholder: string,
    isDisabled? : boolean
}

const SelectSearchBox: React.FC<Props> = ({options,onChange,value,placeholder,isDisabled }) => {
    return (
            <SelectSearch
                value={value}
                options={options}
                search
                filterOptions={fuzzySearch}
                placeholder={placeholder}
                onChange={onChange}
                disabled = {isDisabled}
            />
    )
}

export default SelectSearchBox
